import { useState, useEffect } from 'react';
import { Button, Input, Table, message, Modal, Form, Select } from 'antd';
import { Search, Edit, Lock, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './UserList.module.css';
import { User } from '../../../types/user.type';
import {
  getUsers,
  searchUsers,
  deleteUser,
  updateUser,
  restoreUser,
} from '../../../services/user.service';

const { Option } = Select;

const UserList = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchField, setSearchField] = useState<'name' | 'email'>('name');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      const allUsers = [
        ...response.users.map((user) => ({ ...user, is_deleted: false })),
        ...response.trashedUsers.map((user) => ({ ...user, is_deleted: true })),
      ];
      setUsers(allUsers);
      if (allUsers.length > 0) {
        message.success('Tải danh sách người dùng thành công!');
      } else {
        message.info('Hiện tại không có người dùng nào trong hệ thống.');
      }
    } catch (error: any) {
      setUsers([]);
      message.error('Tải danh sách thất bại: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openSearchModal = (field: 'name' | 'email') => {
    setSearchField(field);
    setIsSearchModalOpen(true);
  };

  const handleSearchCancel = () => {
    setIsSearchModalOpen(false);
    setKeyword('');
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const filteredUsers = await searchUsers(searchField, keyword);
      setUsers(filteredUsers);
      if (filteredUsers.length > 0) {
        message.success('Tìm kiếm người dùng thành công!');
      } else {
        message.info(
          `Không tìm thấy người dùng nào với ${searchField === 'name' ? 'tên' : 'email'} "${keyword}".`
        );
      }
      setIsSearchModalOpen(false);
    } catch (error: any) {
      setUsers([]);
      message.error('Tìm kiếm thất bại: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    form.setFieldsValue(user);
    setIsEditModalOpen(true);
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const handleEditSubmit = async (values: Partial<User>) => {
    if (!selectedUser || !selectedUser.id) return;

    setLoading(true);
    try {
      const updatedUser = await updateUser(selectedUser.id, values);
      setUsers(
        users.map((user) => (user.id === selectedUser.id ? { ...user, ...updatedUser } : user))
      );
      message.success('Cập nhật người dùng thành công!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      form.resetFields();
    } catch (error: any) {
      message.error('Cập nhật thất bại: ' + (error.message || 'Lỗi không xác định'));
    } finally {
      setLoading(false);
    }
  };

  const handleSoftDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận khóa tài khoản',
      content: 'Bạn có chắc chắn muốn khóa người dùng này?',
      okText: 'Khóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteUser(id);
          setUsers(users.map((user) => (user.id === id ? { ...user, is_deleted: true } : user)));
          message.success('Khóa tài khoản người dùng thành công!');
        } catch (error: any) {
          message.error('Khóa thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
      },
    });
  };

  const handleRestore = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận mở khóa tài khoản',
      content: 'Bạn có chắc chắn muốn mở khóa người dùng này?',
      okText: 'Mở khóa',
      okType: 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await restoreUser(id);
          setUsers(users.map((user) => (user.id === id ? { ...user, is_deleted: false } : user)));
          message.success('Mở khóa tài khoản người dùng thành công!');
        } catch (error: any) {
          message.error('Mở khóa thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
      },
    });
  };

  const columns = [
    {
      title: (
        <div>
          Tên
          <Search
            size={16}
            onClick={() => openSearchModal('name')}
            className={styles.searchIcon}
          />
        </div>
      ),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: (
        <div>
          Email
          <Search
            size={16}
            onClick={() => openSearchModal('email')}
            className={styles.searchIcon}
          />
        </div>
      ),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Xác minh',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (_: boolean, record: User) => (
        <span
          className={
            record.is_deleted
              ? styles.verificationLocked
              : record.is_verified
              ? styles.verificationVerified
              : styles.verificationUnverified
          }
        >
          {record.is_deleted
            ? 'Đã khóa'
            : record.is_verified
            ? 'Đã xác minh'
            : 'Chưa xác minh'}
        </span>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <span
          className={
            role.toLowerCase() === 'admin'
              ? styles.roleAdmin
              : role.toLowerCase() === 'staff'
              ? styles.roleStaff
              : styles.roleCustomer
          }
        >
          {role.toLowerCase() === 'customer' ? 'Customer' : role.toLowerCase() === 'staff' ? 'Staff' : 'Admin'}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: User & { id?: number }) => (
        <div>
          <Button
            type='link'
            icon={<Edit size={16} />}
            onClick={() => openEditModal(record)}
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          {record.role.toLowerCase() === 'admin' ? null : (
            record.is_deleted ? (
              <Button
                type='link'
                icon={<Unlock size={16} />}
                onClick={() => handleRestore(record.id!)}
                style={{ marginRight: 8 }}
              >
                Mở khóa
              </Button>
            ) : (
              <Button
                type='link'
                danger
                icon={<Lock size={16} />}
                onClick={() => handleSoftDelete(record.id!)}
                style={{ marginRight: 8 }}
              >
                Khóa
              </Button>
            )
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.userListContainer}>
      <div className={styles.containerInner}>
        <h2 className={styles.title}>Danh sách người dùng</h2>
        <p className={styles.subtitle}>Quản lý thông tin người dùng</p>

        <Table
          columns={columns}
          dataSource={users.map((user) => ({ ...user, key: user.id }))}
          rowKey='key'
          loading={loading}
          className={styles.orderTable}
          locale={{
            emptyText: 'Hiện tại không có người dùng nào trong hệ thống',
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />

        <Modal
          title={`Tìm kiếm theo ${searchField === 'name' ? 'Tên' : 'Email'}`}
          open={isSearchModalOpen}
          onCancel={handleSearchCancel}
          footer={[
            <Button key='cancel' onClick={handleSearchCancel}>
              Hủy
            </Button>,
            <Button key='search' type='primary' onClick={handleSearch}>
              Tìm kiếm
            </Button>,
          ]}
        >
          <Input
            placeholder={`Nhập ${searchField === 'name' ? 'tên' : 'email'}`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            className={styles.searchInput}
          />
        </Modal>

        <Modal
          title='Sửa thông tin người dùng'
          open={isEditModalOpen}
          onCancel={handleEditCancel}
          footer={[
            <Button key='cancel' onClick={handleEditCancel}>
              Hủy
            </Button>,
            <Button key='submit' type='primary' loading={loading} onClick={() => form.submit()}>
              Cập nhật
            </Button>,
          ]}
        >
          <Form form={form} onFinish={handleEditSubmit} layout='vertical'>
            <Form.Item
              name='name'
              label='Tên'
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='email'
              label='Email'
              rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='phone'
              label='Số điện thoại'
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name='role'
              label='Vai trò'
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder='Chọn vai trò'>
                <Option value='customer'>Customer</Option>
                <Option value='staff'>Staff</Option>
                <Option value='admin'>Admin</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <p className={styles.backLink}>
          Quay lại{' '}
          <Link to='/' className={styles.homeLink}>
            Trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default UserList;