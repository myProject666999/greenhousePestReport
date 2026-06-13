-- 大棚病虫害图像上报系统数据库脚本
-- 创建日期: 2026-06-13

-- 创建数据库
CREATE DATABASE IF NOT EXISTS greenhouse_pest_report DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE greenhouse_pest_report;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    role ENUM('farmer', 'technician', 'admin') NOT NULL DEFAULT 'farmer' COMMENT '角色: farmer-农户, technician-农技员, admin-管理员',
    avatar VARCHAR(255) DEFAULT NULL COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_role (role),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 大棚表
CREATE TABLE IF NOT EXISTS greenhouses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '大棚名称',
    address VARCHAR(255) NOT NULL COMMENT '大棚地址',
    farmer_id BIGINT NOT NULL COMMENT '农户ID',
    qr_code VARCHAR(255) NOT NULL UNIQUE COMMENT '二维码标识',
    area DECIMAL(10, 2) DEFAULT NULL COMMENT '大棚面积(平方米)',
    crop_type VARCHAR(50) DEFAULT NULL COMMENT '种植作物类型',
    province VARCHAR(50) DEFAULT NULL COMMENT '省',
    city VARCHAR(50) DEFAULT NULL COMMENT '市',
    district VARCHAR(50) DEFAULT NULL COMMENT '区/县',
    longitude DECIMAL(10, 6) DEFAULT NULL COMMENT '经度',
    latitude DECIMAL(10, 6) DEFAULT NULL COMMENT '纬度',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-正常, 0-停用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_qr_code (qr_code),
    INDEX idx_location (province, city, district),
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='大棚表';

-- 病虫害类型表
CREATE TABLE IF NOT EXISTS pest_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '病虫害名称',
    category ENUM('disease', 'pest') NOT NULL DEFAULT 'disease' COMMENT '类型: disease-病害, pest-虫害',
    description TEXT DEFAULT NULL COMMENT '病虫害描述',
    symptoms TEXT DEFAULT NULL COMMENT '典型症状',
    prevention TEXT DEFAULT NULL COMMENT '预防措施',
    image_url VARCHAR(255) DEFAULT NULL COMMENT '示例图片',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category (category),
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='病虫害类型表';

-- 工单表
CREATE TABLE IF NOT EXISTS work_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '工单编号',
    farmer_id BIGINT NOT NULL COMMENT '上报农户ID',
    greenhouse_id BIGINT NOT NULL COMMENT '大棚ID',
    description TEXT NOT NULL COMMENT '问题描述',
    status ENUM('pending', 'assigned', 'diagnosed', 'feedback_pending', 'completed', 'closed') 
        NOT NULL DEFAULT 'pending' COMMENT '状态: pending-待认领, assigned-已认领, diagnosed-已诊断, feedback_pending-待反馈, completed-已完成, closed-已关闭',
    technician_id BIGINT DEFAULT NULL COMMENT '处理农技员ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    assigned_at TIMESTAMP NULL DEFAULT NULL COMMENT '认领时间',
    diagnosed_at TIMESTAMP NULL DEFAULT NULL COMMENT '诊断时间',
    completed_at TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_greenhouse_id (greenhouse_id),
    INDEX idx_technician_id (technician_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (greenhouse_id) REFERENCES greenhouses(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单表';

-- 工单图片表
CREATE TABLE IF NOT EXISTS work_order_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    image_url VARCHAR(255) NOT NULL COMMENT '图片URL',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_work_order_id (work_order_id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工单图片表';

-- 诊断结果表
CREATE TABLE IF NOT EXISTS diagnoses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL UNIQUE COMMENT '工单ID',
    technician_id BIGINT NOT NULL COMMENT '农技员ID',
    pest_type_id BIGINT DEFAULT NULL COMMENT '病虫害类型ID',
    pest_name VARCHAR(100) DEFAULT NULL COMMENT '病虫害名称(冗余)',
    severity ENUM('mild', 'moderate', 'severe') DEFAULT 'moderate' COMMENT '严重程度: mild-轻度, moderate-中度, severe-重度',
    diagnosis_result TEXT NOT NULL COMMENT '诊断结论',
    treatment_plan TEXT NOT NULL COMMENT '处置方案',
    pesticide VARCHAR(255) DEFAULT NULL COMMENT '建议农药',
    dosage VARCHAR(255) DEFAULT NULL COMMENT '使用剂量',
    frequency VARCHAR(255) DEFAULT NULL COMMENT '使用频次',
    precautions TEXT DEFAULT NULL COMMENT '注意事项',
    remarks TEXT DEFAULT NULL COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_work_order_id (work_order_id),
    INDEX idx_technician_id (technician_id),
    INDEX idx_pest_type_id (pest_type_id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pest_type_id) REFERENCES pest_types(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='诊断结果表';

-- 反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    work_order_id BIGINT NOT NULL COMMENT '工单ID',
    feedback_type ENUM('day3', 'day7') NOT NULL COMMENT '反馈类型: day3-3天反馈, day7-7天反馈',
    result ENUM('recovered', 'no_change', 'worse') NOT NULL COMMENT '效果: recovered-好了, no_change-没好, worse-更差了',
    description TEXT DEFAULT NULL COMMENT '补充说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_work_order_feedback (work_order_id, feedback_type),
    INDEX idx_work_order_id (work_order_id),
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='反馈表';

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    work_order_id BIGINT DEFAULT NULL COMMENT '关联工单ID',
    type ENUM('system', 'feedback_reminder', 'new_order', 'diagnosis_done') NOT NULL COMMENT '通知类型',
    title VARCHAR(255) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读, 1-已读',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (work_order_id) REFERENCES work_orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='通知表';

-- ==================== 初始化数据 ====================

-- 插入管理员账号 (密码: admin123, 需要通过bcrypt加密)
-- 实际使用时请通过后端接口注册
INSERT INTO users (username, password, real_name, phone, role) VALUES
('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', '13800000000', 'admin'),
('tech001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张农技员', '13800000001', 'technician'),
('tech002', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李农技员', '13800000002', 'technician'),
('farmer001', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '王大叔', '13800000003', 'farmer'),
('farmer002', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '赵婶', '13800000004', 'farmer');

-- 插入病虫害类型数据
INSERT INTO pest_types (name, category, description, symptoms, prevention) VALUES
('白粉病', 'disease', '白粉病是由白粉菌科真菌引起的植物病害，主要危害叶片、茎和花柄。', '叶片表面出现白色粉状霉斑，逐渐扩大连片，后期叶片变黄枯死。', '保持通风透光，避免过度密植；发病初期及时喷施三唑酮、戊唑醇等杀菌剂。'),
('霜霉病', 'disease', '霜霉病是由卵菌纲真菌引起的病害，在低温高湿环境下易爆发。', '叶片正面出现淡黄色多角形病斑，叶背长出灰紫色霉层，严重时叶片枯死。', '选用抗病品种；控制大棚湿度，及时通风排湿；喷施代森锰锌、烯酰吗啉等预防。'),
('灰霉病', 'disease', '灰霉病是由灰葡萄孢菌引起的病害，可危害花、果、叶、茎。', '病部出现褐色水渍状病斑，表面生灰色霉层，湿度大时病斑迅速扩大腐烂。', '清除病残体；加强通风降湿；喷施腐霉利、异菌脲、嘧霉胺等。'),
('蚜虫', 'pest', '蚜虫又称蜜虫、腻虫，是一类植食性昆虫，繁殖速度极快。', '叶片卷曲、变形、黄化，分泌蜜露诱发煤污病，还可传播多种病毒病。', '悬挂黄板诱杀；保护瓢虫、草蛉等天敌；喷施吡虫啉、噻虫嗪、苦参碱等。'),
('白粉虱', 'pest', '白粉虱又名小白蛾子，是大棚蔬菜的重要害虫之一。', '成虫和若虫吸食植物汁液，叶片褪绿、变黄、萎蔫，分泌蜜露引起煤污病。', '悬挂黄板诱杀；释放丽蚜小蜂；喷施噻虫嗪、吡丙醚、联苯菊酯等。'),
('红蜘蛛', 'pest', '红蜘蛛又称叶螨，属于蛛形纲蜱螨目，高温干旱条件下易爆发。', '叶片出现黄白色小斑点，严重时叶片枯黄似火烧状，叶背可见细小红色虫体。', '保持大棚湿度；释放捕食螨；喷施阿维菌素、螺螨酯、乙螨唑等。'),
('菜青虫', 'pest', '菜青虫是菜粉蝶的幼虫，主要危害十字花科蔬菜。', '叶片被咬食成孔洞或缺刻，严重时仅留叶脉，虫粪污染叶片。', '安装防虫网；释放赤眼蜂；喷施苏云金杆菌(Bt)、氯虫苯甲酰胺等。');

-- 插入示例大棚数据
INSERT INTO greenhouses (name, address, farmer_id, qr_code, area, crop_type, province, city, district, longitude, latitude) VALUES
('王家草莓1号棚', '山东省济南市历城区董家镇草莓种植基地', 4, 'GH20260001', 800.00, '草莓', '山东省', '济南市', '历城区', 117.123456, 36.654321),
('王家草莓2号棚', '山东省济南市历城区董家镇草莓种植基地', 4, 'GH20260002', 850.00, '草莓', '山东省', '济南市', '历城区', 117.123500, 36.654380),
('赵家番茄1号棚', '山东省济南市章丘区高官寨镇蔬菜基地', 5, 'GH20260003', 900.00, '番茄', '山东省', '济南市', '章丘区', 117.456789, 36.789012),
('赵家黄瓜1号棚', '山东省济南市章丘区高官寨镇蔬菜基地', 5, 'GH20260004', 750.00, '黄瓜', '山东省', '济南市', '章丘区', 117.456850, 36.789080);
