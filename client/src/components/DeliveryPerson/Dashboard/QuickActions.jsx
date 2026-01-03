import React, { useState } from 'react';
import './QuickActions.css';
import { 
  Scan,
  Camera,
  AlertCircle,
  Navigation,
  X,
  Check
} from 'lucide-react';
import { useDeliveryDashboardContext } from '../../../context/DeliveryPersonDashboardContext';

const QuickActions = () => {
  const { verifyQRCode, reportIssue, addLog, loading } = useDeliveryDashboardContext();
  
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueData, setIssueData] = useState({
    order_id: '',
    issue_type: 'delivery',
    description: '',
    priority: 'MEDIUM'
  });
  const [uploadPODData, setUploadPODData] = useState({
    order_id: '',
    image_url: '',
    notes: ''
  });

  const actions = [
    {
      id: 'scan-qr',
      label: 'Scan QR Code',
      icon: <Scan size={24} />,
      onClick: () => setShowQRModal(true),
      color: '#3b82f6'
    },
    {
      id: 'upload-pod',
      label: 'Upload POD',
      icon: <Camera size={24} />,
      onClick: () => handlePODUpload(),
      color: '#10b981'
    },
    {
      id: 'report-issue',
      label: 'Report Issue',
      icon: <AlertCircle size={24} />,
      onClick: () => setShowIssueModal(true),
      color: '#ef4444'
    },
    {
      id: 'navigate',
      label: 'Navigate',
      icon: <Navigation size={24} />,
      onClick: () => handleNavigation(),
      color: '#8b5cf6'
    }
  ];

  const handleQRScan = async () => {
    if (!qrData.trim()) {
      addLog('Please enter QR code data', 'warning');
      return;
    }

    setQrLoading(true);
    addLog(`Verifying QR code: ${qrData}`, 'info');

    try {
      const result = await verifyQRCode(qrData);
      if (result.success) {
        addLog('✅ QR code verified successfully', 'success');
        setShowQRModal(false);
        setQrData('');
        
        // Show success message with details
        if (result.data?.data?.action) {
          addLog(`Action required: ${result.data.data.action} for order ${result.data.data.order_id}`, 'info');
        }
      } else {
        addLog(`❌ QR verification failed: ${result.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error verifying QR: ${error.message}`, 'error');
    } finally {
      setQrLoading(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    
    if (!issueData.order_id || !issueData.description) {
      addLog('Please fill all required fields', 'warning');
      return;
    }

    addLog(`Reporting issue for order ${issueData.order_id}`, 'info');

    try {
      const result = await reportIssue(
        parseInt(issueData.order_id),
        issueData.issue_type,
        issueData.description,
        issueData.priority
      );
      
      if (result.success) {
        addLog('✅ Issue reported successfully', 'success');
        setShowIssueModal(false);
        setIssueData({
          order_id: '',
          issue_type: 'delivery',
          description: '',
          priority: 'MEDIUM'
        });
      } else {
        addLog(`❌ Failed to report issue: ${result.message}`, 'error');
      }
    } catch (error) {
      addLog(`❌ Error reporting issue: ${error.message}`, 'error');
    }
  };

  const handlePODUpload = () => {
    // For now, show a prompt. In real app, this would open file upload
    const orderId = prompt('Enter Order ID for POD upload:');
    if (orderId) {
      const imageUrl = prompt('Enter image URL (in real app, this would be file upload):');
      if (imageUrl) {
        const notes = prompt('Enter any notes (optional):');
        addLog(`POD upload requested for order ${orderId}. Image URL: ${imageUrl}`, 'info');
        
        // In real app, you would call uploadPOD API here
        // uploadPOD(parseInt(orderId), imageUrl, null, notes);
      }
    }
  };

  const handleNavigation = () => {
    const orderId = prompt('Enter Order ID for navigation:');
    if (orderId) {
      addLog(`Opening navigation for order ${orderId}`, 'info');
      // In real app, you would call fetchNavigationDetails and open maps
      window.open(`https://www.google.com/maps/search/?api=1&query=Delivery+Location`, '_blank');
    }
  };

  return (
    <>
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          {actions.map((action) => (
            <button
              key={action.id}
              className="action-btn"
              onClick={action.onClick}
              disabled={loading}
              style={{ '--action-color': action.color }}
            >
              <span className="action-icon">{action.icon}</span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Scan QR Code</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowQRModal(false)}
                disabled={qrLoading}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="qr-scanner">
                <div className="qr-placeholder">
                  <Scan size={64} />
                  <p>Point camera at QR code</p>
                  <span>Make sure the QR code is within the frame</span>
                </div>
                
                <div className="qr-input">
                  <input
                    type="text"
                    placeholder="Or enter QR code manually (e.g., ORD-1001-PICKUP)"
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                    disabled={qrLoading}
                  />
                </div>
                
                {qrLoading && (
                  <div className="qr-loading">
                    <div className="spinner"></div>
                    <p>Verifying QR code...</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowQRModal(false)}
                disabled={qrLoading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleQRScan}
                disabled={qrLoading || !qrData.trim()}
              >
                {qrLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Scan size={16} />
                    Verify QR
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Report Modal */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Report Issue</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowIssueModal(false)}
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="modal-body" onSubmit={handleIssueSubmit}>
              <div className="form-group">
                <label htmlFor="orderId">Order ID *</label>
                <input
                  type="number"
                  id="orderId"
                  className="form-input"
                  placeholder="Enter order ID"
                  value={issueData.order_id}
                  onChange={(e) => setIssueData({...issueData, order_id: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="issueType">Issue Type *</label>
                <select 
                  id="issueType" 
                  className="form-select" 
                  value={issueData.issue_type}
                  onChange={(e) => setIssueData({...issueData, issue_type: e.target.value})}
                  required
                  disabled={loading}
                >
                  <option value="delivery">Delivery Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="customer">Customer Not Available</option>
                  <option value="address">Wrong Address</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select 
                  id="priority" 
                  className="form-select" 
                  value={issueData.priority}
                  onChange={(e) => setIssueData({...issueData, priority: e.target.value})}
                  disabled={loading}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="issueDescription">Description *</label>
                <textarea
                  id="issueDescription"
                  className="form-textarea"
                  placeholder="Describe your issue in detail..."
                  value={issueData.description}
                  onChange={(e) => setIssueData({...issueData, description: e.target.value})}
                  rows="4"
                  required
                  disabled={loading}
                />
              </div>
            </form>
            
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowIssueModal(false)}
                type="button"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                type="submit"
                onClick={handleIssueSubmit}
                disabled={loading || !issueData.order_id || !issueData.description}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;