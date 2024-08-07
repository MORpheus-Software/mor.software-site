//bidform.tsx

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
  const [checkboxErrors, setCheckboxErrors] = useState(false);

  const onFinish = async (values: any) => {
    const { understand1 } = values;
    if (!understand1) {
      setCheckboxErrors(true);
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/proofForm", {
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
                <Input className="cursor-not-allowed" readOnly />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                initialValue={session?.user?.email}
                rules={[
                  { required: true, message: "Please input your email!" },
                ]}
              >
                <Input className="cursor-not-allowed" readOnly />
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
                  <Option value="3">
                    3 - Morpheus Local Install Desktop / Mobile
                  </Option>
                  <Option value="4">
                    4 - TCM / MOR20 Token Standard for Fair Launches
                  </Option>
                  <Option value="5">5 - Protection Fund</Option>
                  <Option value="6">
                    6 - Capital Proofs Extended beyond Lido stETH
                  </Option>
                  <Option value="7">
                    7 - Compute Proofs Morpheus / Lumerin
                  </Option>
                  <Option value="8">8 - Code Proofs & Dashboards</Option>
                  <Option value="9">9 - Frontend Proofs & Examples</Option>
                  <Option value="10">10 - Interoperability</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Links to Contribution Proof"
                name="linksToProof"
                rules={[
                  {
                    required: true,
                    message: "Please provide a link to your contribution!",
                  },
                ]}
              >
                <TextArea
                  placeholder="List links to proof of work that you wish to have merged. Separate the links with commas.                  ."
                  rows={2}
                />
              </Form.Item>

              <Form.Item
                label="Weights Agreed"
                name="weightsAgreed"
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
                label="Description"
                name="description"
                rules={[
                  {
                    required: true,
                    message: "Describe this delivery",
                  },
                ]}
              >
                <TextArea placeholder="Describe this delivery." rows={4} />
              </Form.Item>

              <div
                className={
                  checkboxErrors
                    ? "checkbox-group error"
                    : "checkbox-group gap-2 flex flex-col"
                }
              >
                <Form.Item name="understand1" valuePropName="checked" noStyle>
                  <Checkbox className="text-white">
                    I understand all contributions made to the Morpheus project
                    are open source and MIT licensed.
                  </Checkbox>
                </Form.Item>
              </div>
              {checkboxErrors && (
                <div className="text-red-500">Please accept all terms!</div>
              )}

              <Form.Item>
                <Button
                  disabled={!session?.user?.name}
                  type="primary"
                  className="mt-5"
                  htmlType="submit"
                  loading={loading}
                >
                  {!session?.user?.name ? (
                    <> Login via GitHub to Submit </>
                  ) : (
                    <> Submit </>
                  )}
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
