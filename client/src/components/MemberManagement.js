import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Search, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  QrCode,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  History,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../services/api';
import { fixEncoding } from '../utils/encoding';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showMemberDetails, setShowMemberDetails] = useState(false);
  const [editingMember, setEditingMember] = useState(false);
  const [memberFormData, setMemberFormData] = useState({});
  const [qrData, setQrData] = useState(null);

  const [newMember, setNewMember] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone_number: ''
  });

  const [newMembership, setNewMembership] = useState({
    membership_type: 'MONTHLY',
    purchase_date: new Date().toISOString().split('T')[0],
    expiration_date: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (newMembership.membership_type && newMembership.purchase_date) {
      const purchaseDate = new Date(newMembership.purchase_date);
      let expirationDate = new Date(purchaseDate);
      
      switch (newMembership.membership_type) {
        case 'DAILY':
          expirationDate.setDate(purchaseDate.getDate() + 1);
          break;
        case 'MONTHLY':
          expirationDate.setMonth(purchaseDate.getMonth() + 1);
          break;
        case 'YEARLY':
          expirationDate.setFullYear(purchaseDate.getFullYear() + 1);
          break;
        default:
          break;
      }
      
      setNewMembership(prev => ({
        ...prev,
        expiration_date: expirationDate.toISOString().split('T')[0]
      }));
    }
  }, [newMembership.membership_type, newMembership.purchase_date]);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/api/members');
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Error fetching members');
    } finally {
      setLoading(false);
    }
  };

  const searchMembers = async () => {
    if (!searchQuery.trim()) {
      fetchMembers();
      return;
    }

    try {
      const response = await api.get(`/api/members/search?query=${encodeURIComponent(searchQuery)}`);
      setMembers(response.data);
    } catch (error) {
      console.error('Error searching members:', error);
      toast.error('Error searching members');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/members', newMember);
      toast.success('Member added successfully');
      setShowAddModal(false);
      setNewMember({ username: '', first_name: '', last_name: '', email: '', phone_number: '' });
      fetchMembers();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.error || 'Error adding member');
    }
  };

  const handleAddMembership = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/memberships', {
        ...newMembership,
        member_id: selectedMember.member_id
      });
      toast.success('Membership added successfully');
      setShowMembershipModal(false);
      setSelectedMember(null);
      setNewMembership({
        membership_type: 'MONTHLY',
        purchase_date: new Date().toISOString().split('T')[0],
        expiration_date: ''
      });
      fetchMembers();
    } catch (error) {
      console.error('Error adding membership:', error);
      toast.error(error.response?.data?.error || 'Error adding membership');
    }
  };

  const handleViewQR = async (member) => {
    try {
      const response = await api.get(`/api/members/${member.member_id}/qr-code`);
      setQrData(response.data);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      toast.error('Error fetching QR code');
    }
  };

  const handleDeleteMembership = async (memberId, membershipId) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      try {
        await api.delete(`/api/memberships/${membershipId}`);
        toast.success('Membership deleted successfully');
        fetchMembers(); // Refresh the members list
      } catch (error) {
        console.error('Error deleting membership:', error);
        toast.error('Error deleting membership');
      }
    }
  };

  const handleViewMemberDetails = (member) => {
    setSelectedMember(member);
    setMemberFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      phone_number: member.phone_number || ''
    });
    setShowMemberDetails(true);
    setEditingMember(false);
  };

  const handleEditMember = () => {
    setEditingMember(true);
  };

  const handleSaveMember = async () => {
    try {
      await api.put(`/api/members/${selectedMember.member_id}`, memberFormData);
      toast.success('Member updated successfully');
      setEditingMember(false);
      fetchMembers(); // Refresh the members list
    } catch (error) {
      console.error('Error updating member:', error);
      toast.error('Error updating member');
    }
  };

  const handleCancelEdit = () => {
    setMemberFormData({
      first_name: selectedMember.first_name,
      last_name: selectedMember.last_name,
      email: selectedMember.email,
      phone_number: selectedMember.phone_number || ''
    });
    setEditingMember(false);
  };

  const filteredMembers = members.filter(member =>
    member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Member Management</h1>
          <p className="mt-1 text-sm text-gray-200">
            Manage gym members and their memberships
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search members by name or email..."
                className="input-field pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMembers()}
              />
            </div>
          </div>
          <button
            onClick={searchMembers}
            className="btn-secondary flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Memberships
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-700">
              {filteredMembers.map((member, index) => (
                <tr 
                  key={member.member_id} 
                  className={`hover:bg-gray-800 cursor-pointer ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}`}
                  onClick={() => handleViewMemberDetails(member)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {fixEncoding(member.first_name)} {fixEncoding(member.last_name)}
                        </div>
                        <div className="text-sm text-gray-300">
                          ID: {member.member_id.slice(-8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{member.email}</div>
                    {member.phone_number && (
                      <div className="text-sm text-gray-300">{member.phone_number}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {member.memberships.length} membership(s)
                    </div>
                    <div className="text-sm text-gray-300">
                      {member.memberships.filter(m => m.status === 'ACTIVE').length} active
                    </div>
                    {member.memberships.filter(m => m.status === 'ACTIVE').length > 0 && (
                      <div className="mt-2 space-y-1">
                        {member.memberships.filter(m => m.status === 'ACTIVE').map((membership) => (
                          <div key={membership.membership_id} className="flex items-center justify-between bg-gray-700 rounded px-2 py-1">
                            <span className="text-xs text-gray-200">
                              {membership.membership_type} - {new Date(membership.expiration_date).toLocaleDateString()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMembership(member.member_id, membership.membership_id);
                              }}
                              className="text-red-400 hover:text-red-300 ml-2"
                              title="Delete membership"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMemberDetails(member);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewQR(member);
                        }}
                        className="text-primary-600 hover:text-primary-900"
                        title="View QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                          setShowMembershipModal(true);
                        }}
                        className="text-success-600 hover:text-success-900"
                        title="Add Membership"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300">No members found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Member</h3>
              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="johndoe123"
                    value={newMember.username}
                    onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, and underscores only</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={newMember.first_name}
                    onChange={(e) => setNewMember({...newMember, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={newMember.last_name}
                    onChange={(e) => setNewMember({...newMember, last_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={newMember.phone_number}
                    onChange={(e) => setNewMember({...newMember, phone_number: e.target.value})}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Membership Modal */}
      {showMembershipModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add Membership</h3>
              <p className="text-sm text-gray-500 mb-4">
                For {selectedMember.first_name} {selectedMember.last_name}
              </p>
              <form onSubmit={handleAddMembership} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Membership Type</label>
                  <select
                    className="input-field"
                    value={newMembership.membership_type}
                    onChange={(e) => setNewMembership({...newMembership, membership_type: e.target.value})}
                  >
                    <option value="DAILY">Daily</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={newMembership.purchase_date}
                    onChange={(e) => setNewMembership({...newMembership, purchase_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={newMembership.expiration_date}
                    onChange={(e) => setNewMembership({...newMembership, expiration_date: e.target.value})}
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    Add Membership
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMembershipModal(false);
                      setSelectedMember(null);
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Member QR Code</h3>
              <div className="mb-4">
                <img
                  src={qrData.qr_code_image}
                  alt="QR Code"
                  className="mx-auto border rounded-lg"
                />
              </div>
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>Name:</strong> {qrData.member.first_name} {qrData.member.last_name}</p>
                <p><strong>Email:</strong> {qrData.member.email}</p>
                <p><strong>QR Code:</strong> {qrData.qr_code}</p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberDetails && selectedMember && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" onClick={() => setShowMemberDetails(false)}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-2xl font-bold text-white">Member Details</h3>
                      <p className="text-sm text-gray-300">View and manage member information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMemberDetails(false)}
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Member Information */}
                  <div className="space-y-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Personal Information</h4>
                        {!editingMember && (
                          <button
                            onClick={handleEditMember}
                            className="text-blue-400 hover:text-blue-300 transition-colors duration-300"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">First Name</label>
                          {editingMember ? (
                            <input
                              type="text"
                              value={memberFormData.first_name}
                              onChange={(e) => setMemberFormData({...memberFormData, first_name: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          ) : (
                            <p className="text-white">{selectedMember.first_name}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Last Name</label>
                          {editingMember ? (
                            <input
                              type="text"
                              value={memberFormData.last_name}
                              onChange={(e) => setMemberFormData({...memberFormData, last_name: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          ) : (
                            <p className="text-white">{selectedMember.last_name}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                          {editingMember ? (
                            <input
                              type="email"
                              value={memberFormData.email}
                              onChange={(e) => setMemberFormData({...memberFormData, email: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          ) : (
                            <p className="text-white">{selectedMember.email}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                          {editingMember ? (
                            <input
                              type="tel"
                              value={memberFormData.phone_number}
                              onChange={(e) => setMemberFormData({...memberFormData, phone_number: e.target.value})}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                          ) : (
                            <p className="text-white">{selectedMember.phone_number || 'Not provided'}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Member ID</label>
                          <p className="text-white font-mono text-sm">{selectedMember.member_id}</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-1">Member Since</label>
                          <p className="text-white">{new Date(selectedMember.member_since).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      {editingMember && (
                        <div className="flex space-x-3 mt-6">
                          <button
                            onClick={handleSaveMember}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Memberships */}
                  <div className="space-y-6">
                    <div className="bg-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-white">Memberships</h4>
                        <button
                          onClick={() => {
                            setShowMemberDetails(false);
                            setSelectedMember(selectedMember);
                            setShowMembershipModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Membership
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedMember.memberships.length === 0 ? (
                          <p className="text-gray-300 text-center py-4">No memberships found</p>
                        ) : (
                          selectedMember.memberships.map((membership) => (
                            <div key={membership.membership_id} className="bg-gray-600 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      membership.status === 'ACTIVE' 
                                        ? 'bg-green-900/50 text-green-300 border border-green-500/30' 
                                        : 'bg-red-900/50 text-red-300 border border-red-500/30'
                                    }`}>
                                      {membership.status}
                                    </span>
                                    <span className="text-white font-medium">{membership.membership_type}</span>
                                  </div>
                                  <div className="mt-2 text-sm text-gray-300">
                                    <p>Purchase: {new Date(membership.purchase_date).toLocaleDateString()}</p>
                                    <p>Expires: {new Date(membership.expiration_date).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                {membership.status === 'ACTIVE' && (
                                  <button
                                    onClick={() => handleDeleteMembership(selectedMember.member_id, membership.membership_id)}
                                    className="text-red-400 hover:text-red-300 transition-colors duration-300"
                                    title="Delete membership"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
