## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层"
        A["React 18 + TypeScript"]
        B["React Router DOM 路由"]
        C["Zustand 状态管理"]
        D["Tailwind CSS 样式"]
        E["Lucide React 图标"]
        F["Recharts 图表"]
    end
    
    subgraph "数据层"
        G["Mock 数据服务"]
        H["本地存储持久化"]
    end
    
    subgraph "功能模块"
        I["货品台账模块"]
        J["入库管理模块"]
        K["库区储存模块"]
        L["出库配送模块"]
        M["安全监控模块"]
        N["应急处置模块"]
        O["监管对接模块"]
    end
    
    A --> B
    A --> C
    A --> D
    A --> E
    A --> F
    I --> G
    J --> G
    K --> G
    L --> G
    M --> G
    N --> G
    O --> G
    G --> H
```

## 2. 技术说明

- **前端框架**：React 18 + TypeScript，采用函数式组件和Hooks
- **构建工具**：Vite 5，提供快速的开发体验和构建效率
- **路由管理**：React Router DOM 6，实现7个页面的路由导航
- **状态管理**：Zustand，轻量级状态管理，管理全局状态和业务数据
- **样式方案**：Tailwind CSS 3，原子化CSS，快速构建UI
- **图标库**：Lucide React，提供统一风格的线性图标
- **图表库**：Recharts，React生态的图表组件库，用于数据可视化
- **数据方案**：前端Mock数据，模拟真实业务数据，无需后端服务

## 3. 路由定义

| 路由路径 | 页面用途 |
|---------|---------|
| /inventory | 货品台账 - 危化品基础信息管理和库存预警 |
| /warehousing | 入库管理 - 入库验收登记和危化品检验 |
| /storage | 库区储存 - 分类分区储存可视化和温湿度监控 |
| /outbound | 出库配送 - 出库申请和配送调度 |
| /safety | 安全监控 - 温湿度、可燃气、视频监控和消防检查 |
| /emergency | 应急处置 - 泄漏火灾应急和事故上报 |
| /supervision | 监管对接 - 监管平台上报和数据统计 |

## 4. 数据模型

### 4.1 数据模型定义

```mermaid
erDiagram
    HAZARDOUS_GOODS {
        string id "主键"
        string name "危化品名称"
        string cas_no "CAS号"
        string un_no "UN编号"
        string hazard_class "危险性分类"
        string flash_point "闪点"
        string storage_category "储存类别"
        number stock_quantity "库存数量"
        number max_stock "最大库存"
        number min_stock "最小库存"
        string msds_url "MSDS文件"
        date expiry_date "有效期"
    }
    
    WAREHOUSING_ORDER {
        string id "主键"
        string order_no "入库单号"
        string supplier "供应商"
        date in_date "入库日期"
        string status "状态"
        string goods_id "关联危化品"
        number quantity "数量"
        string batch_no "批次号"
        string inspector "检验员"
        string inspection_result "检验结果"
    }
    
    WAREHOUSE {
        string id "主键"
        string name "库区名称"
        string zone "分区"
        string hazard_type "储存危险类型"
        number temperature "温度"
        number humidity "湿度"
        number gas_concentration "可燃气浓度"
        string status "状态"
    }
    
    STORAGE_LOCATION {
        string id "主键"
        string warehouse_id "所属库区"
        string code "库位编码"
        string goods_id "存放危化品"
        number capacity "容量"
        number used_capacity "已用容量"
        string status "状态"
    }
    
    OUTBOUND_ORDER {
        string id "主键"
        string order_no "出库单号"
        date out_date "出库日期"
        string status "状态"
        string goods_id "关联危化品"
        number quantity "数量"
        string receiver "收货方"
        string vehicle_no "车牌号"
        string driver "驾驶员"
        string supervisor "押运员"
    }
    
    SAFETY_DEVICE {
        string id "主键"
        string type "设备类型"
        string location "安装位置"
        date last_check_date "上次检查日期"
        date next_check_date "下次检查日期"
        string status "状态"
    }
    
    PERSONNEL {
        string id "主键"
        string name "姓名"
        string position "岗位"
        string certificate_no "证书编号"
        date certificate_expiry "证书有效期"
        string status "状态"
    }
    
    EMERGENCY_PLAN {
        string id "主键"
        string type "预案类型"
        string title "预案名称"
        string content "处置步骤"
        string level "响应级别"
    }
    
    SUPERVISION_REPORT {
        string id "主键"
        string report_type "上报类型"
        date report_date "上报日期"
        string status "上报状态"
        string content "上报内容"
    }
    
    HAZARDOUS_GOODS ||--o{ WAREHOUSING_ORDER : "入库明细"
    HAZARDOUS_GOODS ||--o{ STORAGE_LOCATION : "存放位置"
    HAZARDOUS_GOODS ||--o{ OUTBOUND_ORDER : "出库明细"
    WAREHOUSE ||--o{ STORAGE_LOCATION : "包含库位"
```

### 4.2 禁忌物料规则
- 爆炸品不得与任何其他危化品同库存放
- 氧化性物质不得与易燃液体、易燃固体同库存放
- 酸性腐蚀品不得与碱性腐蚀品同库存放
- 有毒物质不得与食品级物质同库存放
- 闪点低于28℃的易燃液体需专库存放
