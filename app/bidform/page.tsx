"use client";

import React, { useState } from "react";
import { Form, Input, Button, Select, Checkbox, notification } from "antd";
import { useSession } from "next-auth/react";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;

const FormComponent: React.FC = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await axios.post("/api/bidForm", {
        ...values,
        userId: session?.user?.id,
      });
      notification.success({ message: "Form submitted successfully!" });
    } catch (error) {
      notification.error({ message: "Failed to submit the form!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-12 md:col-span-9 p-4 mx sm:mx-auto sm:p-6 shadow bg-morBg rounded-2xl max-w-3xl border border-borderTr">
      <div className="lg:grid lg:grid-cols-1 flex flex-col-reverse text-base lg:space-x-4 text-gray-200">
        <div className="col-span-3 flex flex-col h-full">
          <div className="space-y-4 flex flex-col h-full">
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="GitHub Username"
                name="githubUsername"
                initialValue={session?.user?.name}
                rules={[
                  {
                    required: true,
                    message: "Please input your GitHub username!",
                  },
                ]}
              >
                <Input readOnly />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                initialValue={session?.user?.email}
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input readOnly />
              </Form.Item>
              <Form.Item
                label="MRI Number"
                name="mriNumber"
                rules={[
                  { required: true, message: "Please select an MRI number!" },
                ]}
              >
                <Select placeholder="Choose">
                  <Option value="1">
                    1 - Smart Contracts on Ethereum or Arbitrum
                  </Option>
                  <Option value="2">2 - Smart Agent Tools and Examples</Option>
                  {/* Add more options as needed */}
                </Select>
              </Form.Item>
              <Form.Item
                label="Description of Contribution"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Please describe your contribution!",
                  },
                ]}
              >
                <TextArea
                  placeholder="Please describe exactly what you plan to contribute.  How will this benefit the community."
                  rows={4}
                />
              </Form.Item>
              <Form.Item
                label="End of Month Deliverables"
                name="deliverables"
                rules={[
                  {
                    required: true,
                    message: "Please state your deliverables!",
                  },
                ]}
              >
                <TextArea
                  placeholder="What will you deliver by the end of the month?  Maintenance is not a deliverable rewarded with weights."
                  rows={4}
                />
              </Form.Item>
              <Form.Item
                label="Weights Requested"
                name="weightsRequested"
                rules={[
                  {
                    required: true,
                    message: "Please input the weights requested!",
                  },
                ]}
              >
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item
                label="Wallet Address"
                name="walletAddress"
                rules={[
                  {
                    required: true,
                    message: "Please input your wallet address!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Minimum Weights Time"
                name="minimumWeightsTime"
                rules={[
                  {
                    required: true,
                    message: "Please input the minimum weights time!",
                  },
                ]}
              >
                <Input type="number" min={1} />
              </Form.Item>
              <Form.Item
                name="understand"
                valuePropName="checked"
                rules={[
                  { required: true, message: "Please accept the terms!" },
                ]}
              >
                <Checkbox className="text-white">
                  I understand that I will receive a NOTICE OF ACCEPTANCE if
                  this bid is accepted.
                </Checkbox>
              </Form.Item>
              {/* Add other checkboxes as needed */}
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormComponent;
