import { IncomingMessage, ServerResponse } from 'http';

// 定义类型
export type MockHandler = (req: IncomingMessage, res: ServerResponse) => void;
export type MockRouteHandlers = {
  [key: string]: MockHandler | {
    [key: string]: MockHandler
  }
};
export type RolePermissions = {
  [key: string]: string[]
};

// Mock数据
const mockData = {
  // 登录数据
  login: {
    token: 'mock-jwt-token',
    user: {
      id: '1',
      name: '管理员',
      role: 'admin'
    }
  },

  // 用户数据
  users: [
    { id: '1', name: '张三', email: 'zhangsan@example.com', role: 'admin' },
    { id: '2', name: '李四', email: 'lisi@example.com', role: 'editor' },
    { id: '3', name: '王五', email: 'wangwu@example.com', role: 'viewer' },
    { id: '4', name: '赵六', email: 'zhaoliu@example.com', role: 'editor' },
    { id: '5', name: '孙七', email: 'sunqi@example.com', role: 'viewer' }
  ],

  // 角色数据
  roles: [
    { id: '1', name: '超级管理员', description: '系统管理员，拥有最高权限' },
    { id: '2', name: '内容编辑', description: '可以编辑内容但不能修改系统设置' },
    { id: '3', name: '普通用户', description: '只能查看内容' }
  ],

  // 权限数据
  permissions: [
    { id: '1', name: '用户管理', code: 'user:manage' },
    { id: '2', name: '角色管理', code: 'role:manage' },
    { id: '3', name: '权限管理', code: 'permission:manage' },
    { id: '4', name: '菜单管理', code: 'menu:manage' },
    { id: '5', name: '内容编辑', code: 'content:edit' }
  ],

  // 菜单数据
  menus: [
    { id: '1', name: '仪表盘', path: '/', parentId: null, icon: 'el-icon-house' },
    { id: '2', name: '用户管理', path: '/users', parentId: null, icon: 'el-icon-user' },
    { id: '3', name: '权限管理', path: '', parentId: null, icon: 'el-icon-lock' },
    { id: '4', name: '角色管理', path: '/roles', parentId: '3', icon: '' },
    { id: '5', name: '权限管理', path: '/permissions', parentId: '3', icon: '' },
    { id: '6', name: '菜单管理', path: '/menus', parentId: '3', icon: '' }
  ],

  // 角色权限关系
  rolePermissions: {
    '1': ['1', '2', '3', '4', '5'],  // 超级管理员拥有所有权限
    '2': ['2', '5'],                 // 内容编辑只有内容编辑和菜单管理权限
    '3': []                          // 普通用户没有权限
  } as RolePermissions,
  adminUsers: [
    { id: '1', name: '超级管理员', email: 'admin@example.com', role: 'admin' },
  ]
};

// Mock路由处理器
export const mockRoutes: MockRouteHandlers = {
  // 登录接口
  '/api/login': (req: IncomingMessage, res: ServerResponse) => {
    setTimeout(() => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(mockData.login));
    }, 300);
  },

  // 管理员用户接口
  '/api/admins': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData.adminUsers));
      }, 300);
    },
    POST: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const newUser = {
              id: Date.now().toString(),
              ...JSON.parse(body)
            };
            mockData.adminUsers.push(newUser);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    }
  },

  '/api/admins/:id': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const user = mockData.adminUsers.find(u => u.id === id);
        if (user) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(user));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '用户不存在' }));
        }
      }, 300);
    },
    PUT: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const index = mockData.adminUsers.findIndex(u => u.id === id);
            if (index !== -1) {
              mockData.adminUsers[index] = { ...mockData.adminUsers[index], ...JSON.parse(body) };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(mockData.adminUsers[index]));
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: '用户不存在' }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    },
    DELETE: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const index = mockData.adminUsers.findIndex(u => u.id === id);
        if (index !== -1) {
          mockData.adminUsers.splice(index, 1);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '用户不存在' }));
        }
      }, 300);
    }
  },

  // 用户接口
  '/api/users': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData.users));
      }, 300);
    },
    POST: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        // 简单解析body（实际项目中应该使用更复杂的解析方式）
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const newUser = {
              id: Date.now().toString(),
              ...JSON.parse(body)
            };
            mockData.users.push(newUser);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    }
  },

  '/api/users/:id': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const user = mockData.users.find(u => u.id === id);
        if (user) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(user));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '用户不存在' }));
        }
      }, 300);
    },
    PUT: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const index = mockData.users.findIndex(u => u.id === id);
            if (index !== -1) {
              mockData.users[index] = { ...mockData.users[index], ...JSON.parse(body) };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(mockData.users[index]));
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: '用户不存在' }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    },
    DELETE: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const index = mockData.users.findIndex(u => u.id === id);
        if (index !== -1) {
          mockData.users.splice(index, 1);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '用户不存在' }));
        }
      }, 300);
    }
  },

  // 角色接口
  '/api/roles': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData.roles));
      }, 300);
    },
    POST: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const newRole = {
              id: Date.now().toString(),
              ...JSON.parse(body)
            };
            mockData.roles.push(newRole);
            mockData.rolePermissions[newRole.id] = [];
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newRole));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    }
  },

  '/api/roles/:id': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const role = mockData.roles.find(r => r.id === id);
        if (role) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(role));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '角色不存在' }));
        }
      }, 300);
    },
    PUT: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const index = mockData.roles.findIndex(r => r.id === id);
            if (index !== -1) {
              mockData.roles[index] = { ...mockData.roles[index], ...JSON.parse(body) };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(mockData.roles[index]));
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: '角色不存在' }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    },
    DELETE: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const index = mockData.roles.findIndex(r => r.id === id);
        if (index !== -1) {
          mockData.roles.splice(index, 1);
          delete mockData.rolePermissions[id];
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '角色不存在' }));
        }
      }, 300);
    }
  },

  // 角色权限接口
  '/api/roles/:id/permissions': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 2];
        const permissions = mockData.rolePermissions[id] || [];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(permissions));
      }, 300);
    },
    POST: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 2];
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const { permissionIds } = JSON.parse(body);
            mockData.rolePermissions[id] = permissionIds;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    }
  },

  // 权限接口
  '/api/permissions': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData.permissions));
      }, 300);
    },
    POST: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const newPermission = {
              id: Date.now().toString(),
              ...JSON.parse(body)
            };
            mockData.permissions.push(newPermission);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newPermission));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    }
  },

  '/api/permissions/:id': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const permission = mockData.permissions.find(p => p.id === id);
        if (permission) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(permission));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '权限不存在' }));
        }
      }, 300);
    },
    PUT: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const index = mockData.permissions.findIndex(p => p.id === id);
            if (index !== -1) {
              mockData.permissions[index] = { ...mockData.permissions[index], ...JSON.parse(body) };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(mockData.permissions[index]));
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: '权限不存在' }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    },
    DELETE: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const index = mockData.permissions.findIndex(p => p.id === id);
        if (index !== -1) {
          mockData.permissions.splice(index, 1);
          // 从所有角色权限中移除该权限
          Object.keys(mockData.rolePermissions).forEach(roleId => {
            mockData.rolePermissions[roleId] = mockData.rolePermissions[roleId].filter((pid: string) => pid !== id);
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '权限不存在' }));
        }
      }, 300);
    }
  },

  // 菜单接口
  '/api/menus': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData.menus));
      }, 300);
    },
    POST: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const newMenu = {
              id: Date.now().toString(),
              ...JSON.parse(body)
            };
            mockData.menus.push(newMenu);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newMenu));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    }
  },

  '/api/menus/:id': {
    GET: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const menu = mockData.menus.find(m => m.id === id);
        if (menu) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(menu));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '菜单不存在' }));
        }
      }, 300);
    },
    PUT: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const index = mockData.menus.findIndex(m => m.id === id);
            if (index !== -1) {
              mockData.menus[index] = { ...mockData.menus[index], ...JSON.parse(body) };
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(mockData.menus[index]));
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ message: '菜单不存在' }));
            }
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: '请求体格式错误' }));
          }
        });
      }, 300);
    },
    DELETE: (req: IncomingMessage, res: ServerResponse) => {
      setTimeout(() => {
        const urlParts = req.url?.split('/') || [];
        const id = urlParts[urlParts.length - 1].split('?')[0];
        const index = mockData.menus.findIndex(m => m.id === id);
        if (index !== -1) {
          const menuId = mockData.menus[index].id;
          mockData.menus.splice(index, 1);
          // 删除所有子菜单
          mockData.menus = mockData.menus.filter(m => m.parentId !== menuId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: '菜单不存在' }));
        }
      }, 300);
    }
  }
};

// 创建mock服务器的中间件
export function createMockMiddleware() {
  return (req: IncomingMessage, res: ServerResponse, next: Function) => {
    const url = (req.url || '').replace(/\?.*$/, '');
    const method = req.method || 'GET';

    const handler = mockRoutes[url];
    
    if (typeof handler === 'function') {
      return handler(req, res);
    } else if (handler && typeof (handler as any)[method] === 'function') {
      return (handler as any)[method](req, res);
    }

    if (typeof next === 'function') {
      next();
    }
  };
}