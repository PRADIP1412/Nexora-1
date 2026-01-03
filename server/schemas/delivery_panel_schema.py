# delivery_panel_schema.py
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date
from typing import List, Optional, Dict, Any
from enum import Enum
from decimal import Decimal


# ===== ENUMS =====
class DeliveryStatus(str, Enum):
    ASSIGNED = "ASSIGNED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class PaymentType(str, Enum):
    COD = "cod"
    PREPAID = "prepaid"


class PriorityLevel(str, Enum):
    URGENT = "URGENT"
    HIGH = "HIGH"
    NORMAL = "NORMAL"
    LOW = "LOW"


class IssueType(str, Enum):
    DELIVERY = "DELIVERY"
    PAYMENT = "PAYMENT"
    CUSTOMER = "CUSTOMER"
    ADDRESS = "ADDRESS"
    VEHICLE = "VEHICLE"
    APP = "APP"
    OTHER = "OTHER"


class DeliveryPersonStatus(str, Enum):
    ONLINE = "ONLINE"
    OFFLINE = "OFFLINE"
    BUSY = "BUSY"


class ShiftStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


# ===== DASHBOARD SCHEMAS =====
class DashboardStats(BaseModel):
    today_deliveries: int
    completed_today: int
    in_progress: int
    today_earnings: float
    rating: float
    yesterday_comparison: float
    average_per_delivery: float
    total_reviews: int
    online_status: bool


class ActiveDeliveryPreview(BaseModel):
    order_id: int
    order_number: str
    customer_name: str
    delivery_address: str
    status: DeliveryStatus
    expected_time: Optional[str]
    items_count: int
    payment_type: PaymentType
    amount: Optional[float]
    progress: int


class DashboardResponse(BaseModel):
    stats: DashboardStats
    active_deliveries: List[ActiveDeliveryPreview]
    quick_actions: List[str]


# ===== ACTIVE DELIVERIES =====
class DeliveryOrder(BaseModel):
    order_id: int
    order_number: str
    priority: Optional[PriorityLevel]
    status: DeliveryStatus
    status_text: str
    customer_name: str
    customer_phone: str
    customer_avatar: Optional[str]
    pickup_location: str
    delivery_address: str
    distance_km: float
    expected_time: Optional[str]
    items_count: int
    payment_type: PaymentType
    amount: Optional[float]
    progress: int
    eta: Optional[str]
    actions: List[str]


class ActiveDeliveriesResponse(BaseModel):
    deliveries: List[DeliveryOrder]
    total_count: int
    pending_pickup: int
    in_transit: int
    picked_up: int


class StatusUpdateRequest(BaseModel):
    status: DeliveryStatus
    notes: Optional[str] = None


class LiveLocationUpdate(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


# ===== PENDING PICKUPS =====
class PendingPickupItem(BaseModel):
    pickup_id: str
    order_id: int
    order_number: str
    customer_name: str
    pickup_location: str
    pickup_address: str
    items_count: int
    expected_pickup_time: Optional[str]
    distance_km: float
    actions: List[str]


class PendingPickupsResponse(BaseModel):
    pickups: List[PendingPickupItem]
    total_count: int
    locations: List[str]


class QRVerifyRequest(BaseModel):
    qr_data: str
    order_id: Optional[int] = None


class PickupConfirmationRequest(BaseModel):
    delivery_id: int
    confirmation_code: Optional[str] = None
    notes: Optional[str] = None


# ===== COMPLETED DELIVERIES =====
class CompletedDeliveryItem(BaseModel):
    order_id: int
    order_number: str
    customer_name: str
    customer_avatar: Optional[str]
    delivery_address: str
    delivered_at: datetime
    amount: float
    earnings: float
    rating: Optional[float]
    distance_km: float
    status: DeliveryStatus


class DateFilterRequest(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    period: Optional[str] = "7days"  # 7days, 30days, month, custom


class CompletedDeliveriesResponse(BaseModel):
    deliveries: List[CompletedDeliveryItem]
    total_count: int
    summary: Dict[str, Any]


class PODResponse(BaseModel):
    image_url: Optional[str]
    signature_url: Optional[str]
    delivery_notes: Optional[str]
    delivered_at: datetime


# ===== EARNINGS =====
class EarningsPeriod(BaseModel):
    period: str
    amount: float
    deliveries: int
    average_per_delivery: float


class EarningsOverview(BaseModel):
    today: EarningsPeriod
    this_week: EarningsPeriod
    this_month: EarningsPeriod
    total: float
    pending_settlement: float
    settled_amount: float


class TransactionItem(BaseModel):
    transaction_id: str
    date: date
    description: str
    order_count: int
    amount: float
    status: str
    reference: Optional[str]


class EarningsResponse(BaseModel):
    overview: EarningsOverview
    breakdown: Dict[str, float]
    transactions: List[TransactionItem]


class BankDetails(BaseModel):
    account_holder: Optional[str]
    bank_name: Optional[str]
    account_number: Optional[str]
    ifsc_code: Optional[str]
    is_verified: bool = False


# ===== ROUTE MAP =====
class RouteStop(BaseModel):
    stop_number: int
    type: str  # pickup, delivery
    order_id: Optional[int]
    customer_name: Optional[str]
    address: str
    latitude: Optional[float]
    longitude: Optional[float]
    distance_from_previous: float
    estimated_time: str
    status: str


class RouteMapResponse(BaseModel):
    route_id: str
    total_distance_km: float
    estimated_duration_minutes: int
    total_stops: int
    current_stop: int
    stops: List[RouteStop]
    optimized_path: List[Dict[str, float]]
    map_url: Optional[str]


# ===== PERFORMANCE =====
class PerformanceMetrics(BaseModel):
    total_deliveries: int
    on_time_deliveries: int
    on_time_rate: float
    average_rating: float
    total_earnings: float
    average_delivery_time_minutes: float
    cancellation_rate: float
    customer_satisfaction_score: float


class RatingHistoryItem(BaseModel):
    date: date
    rating: float
    feedback: Optional[str]
    order_id: int


class PerformanceResponse(BaseModel):
    metrics: PerformanceMetrics
    rating_history: List[RatingHistoryItem]
    badges: List[Dict[str, Any]]
    trends: Dict[str, float]


# ===== SCHEDULE =====
class ShiftItem(BaseModel):
    shift_id: int
    date: date
    start_time: str
    end_time: str
    location: str
    zone: str
    status: ShiftStatus
    scheduled_deliveries: int
    completed_deliveries: int


class ShiftCreateRequest(BaseModel):
    date: date
    start_time: str
    end_time: str
    location: str
    zone: str
    preferences: Optional[Dict[str, Any]] = None


class ShiftUpdateRequest(BaseModel):
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ShiftStatus] = None


class ScheduleResponse(BaseModel):
    shifts: List[ShiftItem]
    preferences: Dict[str, Any]
    upcoming_shifts: List[ShiftItem]
    calendar_data: Optional[Dict[str, Any]] = None


# ===== VEHICLE =====
class VehicleInfo(BaseModel):
    vehicle_type: Optional[str]
    registration_number: Optional[str]
    color: Optional[str]
    year: Optional[int]
    insurance_valid_until: Optional[date]
    last_service_date: Optional[date]
    next_service_due_km: Optional[float]
    fuel_efficiency: Optional[float]
    health_status: str  # good, warning, critical


class VehicleDocument(BaseModel):
    document_type: str
    document_name: str
    upload_date: date
    valid_until: Optional[date]
    download_url: Optional[str]
    is_verified: bool


class VehicleUpdateRequest(BaseModel):
    registration_number: Optional[str] = None
    insurance_valid_until: Optional[date] = None
    last_service_date: Optional[date] = None
    next_service_due_km: Optional[float] = None


class VehicleResponse(BaseModel):
    info: VehicleInfo
    documents: List[VehicleDocument]
    health_metrics: Dict[str, Any]


# ===== SUPPORT =====
class SupportTicketRequest(BaseModel):
    issue_type: IssueType
    title: str
    description: str
    order_id: Optional[int] = None
    priority: PriorityLevel = PriorityLevel.NORMAL
    attachments: Optional[List[str]] = None


class SupportTicketResponse(BaseModel):
    ticket_id: int
    issue_type: IssueType
    title: str
    status: str
    created_at: datetime
    priority: PriorityLevel
    order_id: Optional[int]
    ticket_number: str


# ===== PROFILE =====
class DeliveryProfile(BaseModel):
    user_id: int
    full_name: str
    email: str
    phone: str
    profile_image_url: Optional[str]
    date_of_birth: Optional[date]
    address: Optional[str]
    joining_date: date
    rating: float
    total_deliveries: int
    on_time_rate: float
    online_status: bool
    current_location: Optional[Dict[str, float]]
    vehicle_info: Optional[VehicleInfo]


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    profile_image_url: Optional[str] = None
    address: Optional[str] = None


class StatusToggleRequest(BaseModel):
    online_status: bool
    current_location: Optional[Dict[str, float]] = None


# ===== COMMON =====
class MessageResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None


class PaginationParams(BaseModel):
    page: int = 1
    page_size: int = 10
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"


class FilterParams(BaseModel):
    status: Optional[DeliveryStatus] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    payment_type: Optional[PaymentType] = None
    priority: Optional[PriorityLevel] = None