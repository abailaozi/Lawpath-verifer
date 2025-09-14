# 单元测试指南

## 🧪 测试覆盖范围

### **已创建的测试文件**

1. **`src/lib/__tests__/auth.test.ts`** - JWT 认证功能测试
2. **`src/lib/__tests__/userRepo.test.ts`** - 用户数据访问层测试
3. **`src/app/api/__tests__/register.test.ts`** - 注册 API 测试
4. **`src/app/api/__tests__/login.test.ts`** - 登录 API 测试
5. **`src/app/__tests__/register-page.test.tsx`** - 注册页面组件测试
6. **`src/app/__tests__/login-page.test.tsx`** - 登录页面组件测试

## 🚀 运行测试

### **安装依赖**

```bash
npm install --save-dev jest @types/jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom ts-jest
```

### **运行所有测试**

```bash
npm test
```

### **监听模式（开发时推荐）**

```bash
npm run test:watch
```

### **生成覆盖率报告**

```bash
npm run test:coverage
```

## 📊 测试类型

### **1. 单元测试 (Unit Tests)**

- **auth.test.ts**: JWT 签名和验证
- **userRepo.test.ts**: 数据库操作函数

### **2. API 测试 (Integration Tests)**

- **register.test.ts**: 注册 API 端点
- **login.test.ts**: 登录 API 端点

### **3. 组件测试 (Component Tests)**

- **register-page.test.tsx**: 注册页面 UI 交互
- **login-page.test.tsx**: 登录页面 UI 交互

## 🎯 测试场景

### **认证功能**

- ✅ JWT 令牌创建和验证
- ✅ 无效令牌处理
- ✅ 空令牌处理

### **用户管理**

- ✅ 用户查找（存在/不存在）
- ✅ 用户创建
- ✅ 数据库错误处理

### **API 端点**

- ✅ 成功注册
- ✅ 重复用户注册
- ✅ 缺少字段验证
- ✅ 成功登录
- ✅ 无效凭据
- ✅ 服务器错误处理

### **UI 组件**

- ✅ 表单渲染
- ✅ 输入验证
- ✅ 错误显示
- ✅ 成功提交
- ✅ 加载状态
- ✅ 用户交互

## 🔧 测试配置

### **Jest 配置** (`jest.config.js`)

- Next.js 集成
- TypeScript 支持
- 路径别名映射
- 测试环境设置

### **测试设置** (`src/setupTests.ts`)

- DOM 测试工具
- Next.js 路由模拟
- Fetch API 模拟
- 环境变量设置

## 📈 覆盖率目标

- **语句覆盖率**: > 90%
- **分支覆盖率**: > 85%
- **函数覆盖率**: > 90%
- **行覆盖率**: > 90%

## 🛠️ 添加新测试

### **创建新测试文件**

```bash
# 在对应目录创建 __tests__ 文件夹
mkdir src/your-module/__tests__

# 创建测试文件
touch src/your-module/__tests__/your-module.test.ts
```

### **测试文件命名规范**

- 组件测试: `component-name.test.tsx`
- 功能测试: `function-name.test.ts`
- API 测试: `api-endpoint.test.ts`

## 🐛 调试测试

### **运行特定测试**

```bash
# 运行特定文件
npm test auth.test.ts

# 运行特定测试套件
npm test -- --testNamePattern="should create a valid JWT token"
```

### **详细输出**

```bash
npm test -- --verbose
```

## 📝 测试最佳实践

1. **AAA 模式**: Arrange, Act, Assert
2. **描述性测试名称**: 清楚说明测试目的
3. **单一职责**: 每个测试只验证一个功能
4. **Mock 外部依赖**: 确保测试隔离
5. **清理状态**: 每个测试后重置状态
