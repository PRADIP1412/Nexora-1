# services/delivery_reports_service.py
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List, Tuple
import io
import csv
import json
from repositories.delivery_panel.delivery_reports_repository import DeliveryReportsRepository
from schemas.delivery_panel.delivery_reports_schema import (
    ReportRange,
    ReportFormat,
    DeliverySummary,
    TrendData,
    PeriodBreakdown,
    OrderReportItem,
    DeliveryReportsResponse
)


class DeliveryReportsService:
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = DeliveryReportsRepository()
    
    def get_delivery_reports(
        self,
        user_id: int,
        report_range: ReportRange = ReportRange.OVERALL,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status_filter: Optional[str] = None,
        limit: int = 100
    ) -> DeliveryReportsResponse:
        """Get comprehensive delivery reports"""
        
        # Get delivery person ID
        delivery_person_id = self.repository.get_delivery_person_id(self.db, user_id)
        if not delivery_person_id:
            raise ValueError("User is not a delivery person")
        
        # Validate and adjust date ranges
        start_date, end_date = self._resolve_date_range(report_range, start_date, end_date)
        
        # Get overall summary
        summary_data = self.repository.get_overall_summary(
            self.db, delivery_person_id, start_date, end_date
        )
        
        # Get period breakdown based on report range
        if report_range == ReportRange.WEEKLY:
            period_data = self.repository.get_weekly_summary(self.db, delivery_person_id)
        elif report_range == ReportRange.MONTHLY:
            period_data = self.repository.get_monthly_summary(self.db, delivery_person_id)
        else:
            period_data = self.repository.get_period_breakdown(
                self.db, delivery_person_id, report_range, start_date, end_date
            )
        
        # Get trend data (last 30 days for all ranges)
        trend_raw = self.repository.get_trend_data(self.db, delivery_person_id, days=30)
        
        # Get order-wise report
        orders_raw = self.repository.get_order_wise_report(
            self.db, delivery_person_id, status_filter, start_date, end_date, limit
        )
        
        # Convert to Pydantic models
        summary = DeliverySummary(**summary_data)
        
        period_breakdown = [
            PeriodBreakdown(**period) for period in period_data[:10]  # Limit to 10 periods
        ]
        
        trend = TrendData(
            labels=trend_raw['labels'],
            delivery_data=trend_raw['delivery_data'],
            earnings_data=trend_raw['earnings_data']
        )
        
        orders = [
            OrderReportItem(**order) for order in orders_raw
        ]
        
        # Build response
        filters_applied = {
            'report_range': report_range.value,
            'status_filter': status_filter,
            'date_range_applied': start_date is not None and end_date is not None
        }
        
        return DeliveryReportsResponse(
            summary=summary,
            period_breakdown=period_breakdown,
            trend=trend,
            orders=orders,
            filters_applied=filters_applied,
            report_range=report_range,
            period_start=start_date,
            period_end=end_date
        )
    
    def _resolve_date_range(
        self,
        report_range: ReportRange,
        start_date: Optional[datetime],
        end_date: Optional[datetime]
    ) -> tuple[Optional[datetime], Optional[datetime]]:
        """Resolve date ranges based on report type"""
        
        now = datetime.now()
        
        if report_range == ReportRange.WEEKLY:
            # Default to current week
            if not start_date:
                start_date = now - timedelta(days=now.weekday())
                start_date = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
            if not end_date:
                end_date = start_date + timedelta(days=6)
                end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        elif report_range == ReportRange.MONTHLY:
            # Default to current month
            if not start_date:
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if not end_date:
                # Last day of month
                next_month = start_date.replace(day=28) + timedelta(days=4)
                end_date = next_month - timedelta(days=next_month.day)
                end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        elif report_range == ReportRange.CUSTOM:
            # Validate custom dates
            if not start_date or not end_date:
                raise ValueError("Both start_date and end_date are required for custom range")
            
            if start_date > end_date:
                raise ValueError("start_date cannot be after end_date")
            
            # Cap end_date to today if future
            if end_date > now:
                end_date = now
        
        else:  # OVERALL
            # No date constraints for overall
            start_date = None
            end_date = None
        
        return start_date, end_date
    
    def get_quick_summary(self, user_id: int) -> Dict[str, Any]:
        """Get quick summary for dashboard"""
        
        delivery_person_id = self.repository.get_delivery_person_id(self.db, user_id)
        if not delivery_person_id:
            raise ValueError("User is not a delivery person")
        
        # Today's summary
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.now().replace(hour=23, minute=59, second=59, microsecond=999999)
        
        today_data = self.repository.get_overall_summary(
            self.db, delivery_person_id, today_start, today_end
        )
        
        # This week's summary
        week_start = datetime.now() - timedelta(days=datetime.now().weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        
        week_data = self.repository.get_overall_summary(
            self.db, delivery_person_id, week_start, datetime.now()
        )
        
        # This month's summary
        month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        month_data = self.repository.get_overall_summary(
            self.db, delivery_person_id, month_start, datetime.now()
        )
        
        return {
            'today': today_data,
            'this_week': week_data,
            'this_month': month_data,
            'delivery_person_id': delivery_person_id
        }
    
    def export_delivery_report(
        self,
        user_id: int,
        report_format: ReportFormat,
        report_range: ReportRange = ReportRange.OVERALL,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        status_filter: Optional[str] = None,
        export_type: str = "summary"  # "summary", "orders", or "full"
    ) -> Tuple[bytes, str]:
        """Export delivery report in specified format"""
        
        # Get delivery person ID
        delivery_person_id = self.repository.get_delivery_person_id(self.db, user_id)
        if not delivery_person_id:
            raise ValueError("User is not a delivery person")
        
        # Validate and adjust date ranges
        start_date, end_date = self._resolve_date_range(report_range, start_date, end_date)
        
        if export_type == "orders":
            # Export only order data
            orders_data = self.repository.get_order_wise_report(
                self.db, delivery_person_id, status_filter, start_date, end_date, limit=1000
            )
            # Convert to list of dicts for export
            orders_list = [order.__dict__ for order in orders_data] if hasattr(orders_data[0], '__dict__') else orders_data
            return self._export_data(orders_list, report_format, "delivery_orders")
        
        elif export_type == "summary":
            # Export summary data
            summary_data = self.repository.get_overall_summary(
                self.db, delivery_person_id, start_date, end_date
            )
            period_data = self.repository.get_period_breakdown(
                self.db, delivery_person_id, report_range, start_date, end_date
            )
            
            # Convert to exportable format
            export_data = {
                "summary": summary_data,
                "periods": period_data[:10],
                "report_range": report_range.value,
                "date_range": {
                    "start": start_date.isoformat() if start_date else None,
                    "end": end_date.isoformat() if end_date else None
                }
            }
            
            return self._export_data([export_data], report_format, "delivery_summary")
        
        else:  # "full" export
            # Get all data
            summary_data = self.repository.get_overall_summary(
                self.db, delivery_person_id, start_date, end_date
            )
            period_data = self.repository.get_period_breakdown(
                self.db, delivery_person_id, report_range, start_date, end_date
            )
            orders_data = self.repository.get_order_wise_report(
                self.db, delivery_person_id, status_filter, start_date, end_date, limit=1000
            )
            trend_data = self.repository.get_trend_data(self.db, delivery_person_id, days=30)
            
            # Convert orders to dicts if needed
            orders_list = orders_data
            if orders_data and hasattr(orders_data[0], '__dict__'):
                orders_list = [order.__dict__ for order in orders_data]
            
            export_data = {
                "summary": summary_data,
                "periods": period_data,
                "orders": orders_list,
                "trend": trend_data,
                "metadata": {
                    "report_range": report_range.value,
                    "generated_at": datetime.now().isoformat(),
                    "delivery_person_id": delivery_person_id,
                    "filters": {
                        "status": status_filter,
                        "date_range": {
                            "start": start_date.isoformat() if start_date else None,
                            "end": end_date.isoformat() if end_date else None
                        }
                    }
                }
            }
            
            return self._export_data(export_data, report_format, "delivery_full_report")
    
    def _export_data(
        self, 
        data: Any, 
        report_format: ReportFormat, 
        filename_prefix: str
    ) -> Tuple[bytes, str]:
        """Convert data to specified format"""
        
        if not data:
            data = {"message": "No data available"}
        
        if report_format == ReportFormat.CSV:
            return self._to_csv(data), "text/csv"
        
        elif report_format == ReportFormat.JSON:
            return self._to_json(data), "application/json"
        
        elif report_format == ReportFormat.PDF:
            return self._to_pdf(data), "application/pdf"
        
        else:
            raise ValueError(f"Unsupported export format: {report_format}")
    
    def _to_csv(self, data: Any) -> bytes:
        """Convert data to CSV format"""
        
        if not data:
            return b""
        
        output = io.StringIO()
        
        # Handle different data structures
        if isinstance(data, dict):
            # Flatten dict for CSV
            if "orders" in data and isinstance(data["orders"], list):
                # Use orders data for CSV
                rows = data["orders"]
            else:
                # Convert dict to list of key-value pairs
                rows = []
                for key, value in data.items():
                    if isinstance(value, dict):
                        for sub_key, sub_value in value.items():
                            rows.append({
                                "category": key,
                                "field": sub_key,
                                "value": sub_value
                            })
                    elif isinstance(value, list):
                        for i, item in enumerate(value):
                            if isinstance(item, dict):
                                rows.append({**item, f"{key}_index": i})
                            else:
                                rows.append({
                                    "category": key,
                                    "index": i,
                                    "value": item
                                })
                    else:
                        rows.append({"field": key, "value": value})
        elif isinstance(data, list):
            rows = data
        else:
            rows = [{"data": str(data)}]
        
        if not rows:
            return b""
        
        # Get all unique keys from all dictionaries
        fieldnames = set()
        for item in rows:
            if isinstance(item, dict):
                fieldnames.update(item.keys())
        
        fieldnames = list(fieldnames)
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for item in rows:
            if isinstance(item, dict):
                # Convert datetime objects to string
                row = {}
                for key, value in item.items():
                    if isinstance(value, datetime):
                        row[key] = value.isoformat()
                    elif isinstance(value, (dict, list)):
                        row[key] = str(value)
                    else:
                        row[key] = value
                writer.writerow(row)
        
        return output.getvalue().encode('utf-8')
    
    def _to_json(self, data: Any) -> bytes:
        """Convert data to JSON format"""
        
        def json_serializer(obj):
            """JSON serializer for objects not serializable by default"""
            if isinstance(obj, datetime):
                return obj.isoformat()
            if hasattr(obj, 'isoformat'):
                return obj.isoformat()
            raise TypeError(f"Type {type(obj)} not serializable")
        
        return json.dumps(data, indent=2, default=json_serializer).encode('utf-8')
    
    def _to_pdf(self, data: Any) -> bytes:
        """Convert data to PDF format"""
        try:
            from services.delivery_panel.pdf_generator import PDFReportGenerator
            
            # Check if we have the structure for comprehensive report
            if isinstance(data, dict) and "summary" in data and "orders" in data:
                # Get delivery person info for PDF header
                from models.user import User
                from models.delivery import DeliveryPerson
                
                delivery_person_id = data.get("metadata", {}).get("delivery_person_id")
                if delivery_person_id:
                    delivery_person = self.db.query(DeliveryPerson).filter(
                        DeliveryPerson.delivery_person_id == delivery_person_id
                    ).first()
                    
                    user_name = "Delivery Person"
                    if delivery_person:
                        user = self.db.query(User).filter(
                            User.user_id == delivery_person.user_id
                        ).first()
                        if user:
                            user_name = f"{user.first_name} {user.last_name}"
                else:
                    user_name = "Delivery Person"
                
                # Parse dates if available
                start_date_str = data.get("metadata", {}).get("filters", {}).get("date_range", {}).get("start")
                end_date_str = data.get("metadata", {}).get("filters", {}).get("date_range", {}).get("end")
                
                start_date = None
                end_date = None
                
                if start_date_str:
                    try:
                        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                    except:
                        pass
                
                if end_date_str:
                    try:
                        end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                    except:
                        pass
                
                pdf_bytes = PDFReportGenerator.generate_delivery_report_pdf(
                    summary_data=data.get("summary", {}),
                    period_data=data.get("periods", []),
                    trend_data=data.get("trend", {}),
                    orders_data=data.get("orders", []),
                    report_range=data.get("metadata", {}).get("report_range", "overall"),
                    start_date=start_date,
                    end_date=end_date,
                    delivery_person_name=user_name
                )
                return pdf_bytes
            else:
                # Generate simple PDF for basic data
                pdf_bytes = PDFReportGenerator.generate_simple_pdf(
                    data if isinstance(data, list) else [data],
                    "Delivery Report"
                )
                return pdf_bytes
                
        except ImportError:
            # Fallback to JSON if PDF generator is not available
            return self._to_json(data)
        except Exception as e:
            # Fallback to JSON on any error
            error_data = {
                "error": "Failed to generate PDF",
                "message": str(e),
                "data": data
            }
            return self._to_json(error_data)