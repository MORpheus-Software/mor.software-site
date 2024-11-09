import React from 'react';
import { Modal, Select, Button, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Category } from './types'; // Adjust the import path as necessary

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ExportDataModalProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
  type: string;
  setType: (value: string) => void;
  timeframe: [Dayjs, Dayjs] | null;
  setTimeframe: (dates: [Dayjs, Dayjs] | null) => void;
  selectedCategories: number[];
  setSelectedCategories: (values: number[]) => void;
  handleExport: () => void;
  isPending: boolean;
}

const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isVisible,
  onClose,
  categories,
  type,
  setType,
  timeframe,
  setTimeframe,
  selectedCategories,
  setSelectedCategories,
  handleExport,
  isPending,
}) => {
  return (
    <Modal title="Export Data" open={isVisible} onCancel={onClose} footer={null}>
      <Select value={type} onChange={setType} style={{ width: '100%', marginBottom: 20 }}>
        <Option value="proofContribution">Proof Contributions</Option>
        <Option value="standaloneJobForm">Standalone Job Forms</Option>
        <Option value="proposals">MRC</Option>
        <Option value="mrcjobs">MRC Jobs</Option>
      </Select>

      <RangePicker
        value={timeframe}
        onChange={(dates) => setTimeframe(dates as [Dayjs, Dayjs] | null)}
        style={{ width: '100%', marginBottom: 20 }}
        disabledDate={(current) => current && current > dayjs().endOf('day')}
      />

      <Select
        mode="multiple"
        placeholder="Select Categories"
        value={selectedCategories}
        onChange={setSelectedCategories}
        style={{ width: '100%', marginBottom: 20 }}
      >
        {categories.map((category) => (
          <Option key={category.id} value={category.id}>
            {category.name}
          </Option>
        ))}
      </Select>

      <Button
        type="primary"
        onClick={handleExport}
        disabled={isPending || !timeframe || selectedCategories.length === 0}
      >
        {isPending ? 'Exporting...' : 'Export Data'}
      </Button>
    </Modal>
  );
};

export default ExportDataModal;
