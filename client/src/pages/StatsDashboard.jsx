import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Space, DatePicker, Select, Spin, List } from 'antd';
import { RiseOutlined, BugOutlined, EnvironmentOutlined, BarChartOutlined } from '@ant-design/icons';
import { getOverview, getTopPests, getRegionSummary, getPestDistribution } from '../api/stats';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const StatsDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(null);
  const [topPests, setTopPests] = useState([]);
  const [regionData, setRegionData] = useState([]);
  const [pestDistribution, setPestDistribution] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    loadStats();
  }, [dateRange, province, city]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: dateRange[0]?.format('YYYY-MM-DD'),
        end_date: dateRange[1]?.format('YYYY-MM-DD'),
        province: province || undefined,
        city: city || undefined
      };

      const [overviewRes, topPestsRes, regionRes, pestDistRes] = await Promise.all([
        getOverview(),
        getTopPests(params),
        getRegionSummary(params),
        getPestDistribution(params)
      ]);

      setOverview(overviewRes.data);
      setTopPests(topPestsRes.data);
      setRegionData(regionRes.data);
      setPestDistribution(pestDistRes.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const topPestColumns = [
    { title: '排名', key: 'rank', width: 60, render: (_, __, idx) => <Tag color={idx < 3 ? 'red' : 'blue'}>{idx + 1}</Tag> },
    { title: '病虫害名称', dataIndex: 'pest_name', key: 'pest_name', width: 120 },
    { title: '发生次数', dataIndex: 'count', key: 'count', width: 80, render: v => <b style={{ color: '#fa8c16' }}>{v}</b> },
    { title: '轻度', dataIndex: 'mild_count', key: 'mild_count', width: 60 },
    { title: '中度', dataIndex: 'moderate_count', key: 'moderate_count', width: 60 },
    { title: '重度', dataIndex: 'severe_count', key: 'severe_count', width: 60 },
    { title: '已康复', dataIndex: 'recovered_count', key: 'recovered_count', width: 60 },
    { title: '无变化', dataIndex: 'no_change_count', key: 'no_change_count', width: 60 },
    { title: '加重', dataIndex: 'worse_count', key: 'worse_count', width: 60 }
  ];

  const regionColumns = [
    { title: '区域', key: 'region', width: 180, render: (_, r) => <Space><EnvironmentOutlined />{r.province}-{r.city}-{r.district}</Space> },
    { title: '工单总数', dataIndex: 'total_orders', key: 'total_orders', width: 80 },
    { title: '待处理', dataIndex: 'pending_count', key: 'pending_count', width: 60 },
    { title: '处理中', dataIndex: 'processing_count', key: 'processing_count', width: 60 },
    { title: '已完成', dataIndex: 'completed_count', key: 'completed_count', width: 60 },
    { title: '病虫害种类', dataIndex: 'pest_variety_count', key: 'pest_variety_count', width: 100 }
  ];

  const severityColor = { mild: 'green', moderate: 'orange', severe: 'red' };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>📊 数据统计分析</h2>

      <Card style={{ marginBottom: 16, borderRadius: 8 }}>
        <Space wrap>
          <span>时间范围：</span>
          <RangePicker value={dateRange} onChange={setDateRange} />
          <span>省份：</span>
          <Select style={{ width: 120 }} value={province} onChange={setProvince} allowClear placeholder="全部">
            <Select.Option value="山东省">山东省</Select.Option>
          </Select>
          <span>城市：</span>
          <Select style={{ width: 120 }} value={city} onChange={setCity} allowClear placeholder="全部">
            <Select.Option value="济南市">济南市</Select.Option>
          </Select>
        </Space>
      </Card>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 100 }}><Spin size="large" /></div>
      ) : (
        <>
          {overview && (
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="工单总数" value={overview.total} prefix={<BarChartOutlined />} valueStyle={{ color: '#722ed1' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="待认领" value={overview.pending} prefix={<RiseOutlined />} valueStyle={{ color: '#fa8c16' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="处理中" value={overview.assigned + overview.diagnosed} valueStyle={{ color: '#1890ff' }} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic title="已完成" value={overview.completed} valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Card title={<span><BugOutlined /> 本月高发病虫害 Top 10</span>} style={{ marginBottom: 16, borderRadius: 8 }}>
                <Table
                  rowKey="pest_name"
                  columns={topPestColumns}
                  dataSource={topPests}
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card title={<span><EnvironmentOutlined /> 区域汇总</span>} style={{ marginBottom: 16, borderRadius: 8 }}>
                <Table
                  rowKey={(r) => `${r.province}-${r.city}-${r.district}`}
                  columns={regionColumns}
                  dataSource={regionData}
                  pagination={false}
                  size="small"
                  scroll={{ y: 350 }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="🦠 病虫害分布详情" style={{ borderRadius: 8 }}>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
              dataSource={pestDistribution}
              renderItem={item => (
                <List.Item>
                  <Card size="small" style={{ height: '100%' }}>
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{item.pest_name}</span>
                          <Tag color={severityColor[item.severity]}>{item.severity === 'mild' ? '轻' : item.severity === 'moderate' ? '中' : '重'}</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ margin: '4px 0' }}><EnvironmentOutlined /> {item.province} {item.city} {item.district}</p>
                          <p style={{ margin: '4px 0', color: '#fa8c16', fontWeight: 'bold' }}>{item.count} 次发生</p>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default StatsDashboard;
