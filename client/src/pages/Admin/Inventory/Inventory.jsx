// src/pages/Admin/Inventory/Inventory.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { InventoryProvider } from '../../../context/InventoryContext';

// Main Components
import InventoryLayout from '../../../components/Admin/Inventory/InventoryLayout';
import InventoryDashboard from '../../../components/Admin/Inventory/InventoryDashboard';

// Stock Components
import StockSummary from '../../../components/Admin/Inventory/Stock/StockSummary';
import StockMovements from '../../../components/Admin/Inventory/Stock/StockMovements';

// Company Components
import CompanyList from '../../../components/Admin/Inventory/Company/CompanyList';
import CompanyForm from '../../../components/Admin/Inventory/Company/CompanyForm';
import CompanyView from '../../../components/Admin/Inventory/Company/CompanyView';

// Supplier Components
import SupplierList from '../../../components/Admin/Inventory/Supplier/SupplierList';
import SupplierForm from '../../../components/Admin/Inventory/Supplier/SupplierForm';
import SupplierView from '../../../components/Admin/Inventory/Supplier/SupplierView';

// Purchase Components
import PurchaseList from '../../../components/Admin/Inventory/Purchase/PurchaseList';
import PurchaseForm from '../../../components/Admin/Inventory/Purchase/PurchaseForm';
import PurchaseView from '../../../components/Admin/Inventory/Purchase/PurchaseView';

// Purchase Return Components
import ReturnList from '../../../components/Admin/Inventory/PurchaseReturn/ReturnList';
import ReturnForm from '../../../components/Admin/Inventory/PurchaseReturn/ReturnForm';
import ReturnView from '../../../components/Admin/Inventory/PurchaseReturn/ReturnView';

// Batch Components
import BatchList from '../../../components/Admin/Inventory/Batch/BatchList';
import BatchForm from '../../../components/Admin/Inventory/Batch/BatchForm';
import BatchView from '../../../components/Admin/Inventory/Batch/BatchView';

const Inventory = () => {
  return (
    <InventoryProvider>
      <div className="flex min-h-screen bg-gray-50">
        {/* Inventory Layout will handle sidebar + header */}
        <InventoryLayout>
          <div className="flex-1 p-6">
            <Routes>
              {/* Dashboard Route */}
              <Route index element={<InventoryDashboard />} />
              
              {/* Stock Routes */}
              <Route path="stock">
                <Route index element={<StockSummary />} />
                <Route path="movements" element={<StockMovements />} />
              </Route>
              
              {/* Company Routes */}
              <Route path="companies">
                <Route index element={<CompanyList />} />
                <Route path="new" element={<CompanyForm />} />
                <Route path=":companyId" element={<CompanyView />} />
                <Route path=":companyId/edit" element={<CompanyForm />} />
              </Route>
              
              {/* Supplier Routes */}
              <Route path="suppliers">
                <Route index element={<SupplierList />} />
                <Route path="new" element={<SupplierForm />} />
                <Route path=":supplierId" element={<SupplierView />} />
                <Route path=":supplierId/edit" element={<SupplierForm />} />
              </Route>
              
              {/* Purchase Routes */}
              <Route path="purchases">
                <Route index element={<PurchaseList />} />
                <Route path="new" element={<PurchaseForm />} />
                <Route path=":purchaseId" element={<PurchaseView />} />
                <Route path=":purchaseId/edit" element={<PurchaseForm />} />
              </Route>
              
              {/* Purchase Return Routes */}
              <Route path="returns">
                <Route index element={<ReturnList />} />
                <Route path="new" element={<ReturnForm />} />
                <Route path=":returnId" element={<ReturnView />} />
              </Route>
              
              {/* Batch Routes */}
              <Route path="batches">
                <Route index element={<BatchList />} />
                <Route path="new" element={<BatchForm />} />
                <Route path=":batchId" element={<BatchView />} />
                <Route path=":batchId/edit" element={<BatchForm />} />
              </Route>
              
              {/* Fallback route - Redirect to dashboard */}
              <Route path="*" element={<InventoryDashboard />} />
            </Routes>
          </div>
        </InventoryLayout>
      </div>
    </InventoryProvider>
  );
};

export default Inventory;