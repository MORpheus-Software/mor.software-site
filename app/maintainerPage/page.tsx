'use client';
// MaintainerPage.tsx
import React, { useEffect, useState, useTransition } from 'react';
import { Button } from 'antd';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import dayjs, { Dayjs } from 'dayjs';

import ExportDataModal from './ExportDataModal';
import CategorySection from './CategorySection';
import ProposalModal from './ProposalModal';
import { exportData } from '@/lib/server';
import {
  Category,
  Proposal,
  JobForm,
  ProposalComment,
  JobFormComment,
  StandaloneJobForm,
} from './types'; // Adjust the import path as necessary
import StandaloneJobModal from './StandaloneJobModal';

export default function MaintainerPage() {
  const { address, isConnected } = useAccount();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [jobForms, setJobForms] = useState<JobForm[]>([]);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [comment, setComment] = useState<string>('');
  const [jobComments, setJobComments] = useState<{ [key: number]: string }>({});

  const [timeframe, setTimeframe] = useState<[Dayjs, Dayjs] | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [type, setType] = useState('proofContribution');
  const [isPending, startTransition] = useTransition();
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);
  const [selectedStandaloneJob, setSelectedStandaloneJob] = useState<StandaloneJobForm | null>(
    null,
  );
  const [isStandaloneJobModalVisible, setIsStandaloneJobModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (address && isConnected) {
      fetchCategories();
    }
  }, [address, isConnected]);

  // Fetch categories associated with the maintainer's wallet address
  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories?walletAddress=${address}`);
      const data: Category[] = await response.json();

      if (response.ok && data.length > 0) {
        setCategories(data);
      } else {
        toast.error('No categories found.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories.');
    }
  };

  const fetchStandaloneJobDetails = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobForm/standalone/${jobId}`);
      const data = await response.json();
      console.log(data, 'dataa');

      if (response.ok) {
        setSelectedStandaloneJob(data.standaloneJob);
        setIsStandaloneJobModalVisible(true);
      } else {
        toast.error('Failed to fetch standalone job details.');
      }
    } catch (error) {
      console.error('Error fetching standalone job details:', error);
      toast.error('Failed to fetch standalone job details.');
    }
  };

  // Fetch proposal details including job forms
  const fetchProposalDetails = async (proposalId: number) => {
    try {
      const response = await fetch(`/api/proposals/${proposalId}`);
      const { proposal, jobForms } = await response.json();

      if (response.ok) {
        setSelectedProposal(proposal);
        setJobForms(jobForms);
        setIsModalVisible(true);
      } else {
        toast.error('Failed to fetch proposal details.');
      }
    } catch (error) {
      console.error('Error fetching proposal details:', error);
      toast.error('Failed to fetch proposal details.');
    }
  };

  // Handle exporting data
  const handleExport = async () => {
    if (!timeframe) {
      toast.error('Please select a timeframe.');
      return;
    }
    const startDate = timeframe[0].toISOString();
    const endDate = timeframe[1].toISOString();

    try {
      // Call the server function from lib.ts to get the CSV string
      const csvString = await exportData(type, startDate, endDate, selectedCategories);

      // Create a Blob from the CSV string
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error exporting data.');
    }
  };

  const handleUpdateStandaloneJobStatus = async (jobId: string, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/jobForm/standalone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: jobId,
          status,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        fetchCategories(); // Refresh the categories list after update
        toast.success('Standalone Job status updated successfully!');
      } else {
        toast.error('Failed to update Standalone Job status.');
      }
    } catch (error) {
      console.error('Error updating Standalone Job status:', error);
      toast.error('Failed to update Standalone Job status.');
    } finally {
      fetchStandaloneJobDetails(jobId);
      setUpdating(false);
    }
  };

  // Update proposal status
  const handleUpdateStatus = async (proposalId: number, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/proposals', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: proposalId,
          status,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        fetchCategories(); // Refresh the proposals list after update
        toast.success('Proposal status updated successfully!');
      } else {
        toast.error('Failed to update proposal status.');
      }
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error('Failed to update proposal status.');
    } finally {
      fetchProposalDetails(proposalId);
      setUpdating(false);
    }
  };

  // Update job form status
  const handleUpdateJobStatus = async (jobFormId: number, status: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/jobForm', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: jobFormId,
          status,
          username: '',
          walletAddress: address,
        }),
      });

      if (response.ok) {
        if (selectedProposal?.id) {
          fetchProposalDetails(selectedProposal.id); // Refresh the proposal details after update
        }
        toast.success('JobForm status updated successfully!');
      } else {
        toast.error('Failed to update JobForm status.');
      }
    } catch (error) {
      console.error('Error updating JobForm status:', error);
      toast.error('Failed to update JobForm status.');
    } finally {
      setUpdating(false);
    }
  };

  const [standaloneJobComment, setStandaloneJobComment] = useState<string>('');

  const handleStandaloneJobCommentSubmit = async () => {
    if (!selectedStandaloneJob) return;

    try {
      const response = await fetch('/api/jobForm/standalone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment: true,
          jobId: selectedStandaloneJob.id,
          text: standaloneJobComment,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        toast.success('Comment added to Standalone Job successfully!');
        setStandaloneJobComment('');
        fetchStandaloneJobDetails(selectedStandaloneJob.id);
      } else {
        toast.error('Failed to add comment to Standalone Job.');
      }
    } catch (error) {
      console.error('Error adding comment to Standalone Job:', error);
      toast.error('Failed to add comment to Standalone Job.');
    }
  };

  // Submit a comment on a proposal
  const handleCommentSubmit = async () => {
    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: selectedProposal?.id,
          text: comment,
          walletAddress: address,
        }),
      });

      if (response.ok) {
        toast.success('Comment added successfully!');
        setComment('');
        if (selectedProposal?.id) {
          fetchProposalDetails(selectedProposal.id); // Refresh proposal details
        }
      } else {
        toast.error('Failed to add comment.');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment.');
    }
  };

  // Submit a comment on a job form
  const handleJobCommentSubmit = async (jobFormId: number) => {
    try {
      const response = await fetch('/api/jobForm/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobFormId,
          text: jobComments[jobFormId] || '',
          walletAddress: address,
        }),
      });

      if (response.ok) {
        toast.success('Comment added to job form successfully!');
        setJobComments((prev) => ({ ...prev, [jobFormId]: '' }));
        if (selectedProposal?.id) {
          fetchProposalDetails(selectedProposal.id); // Refresh proposal details
        }
      } else {
        toast.error('Failed to add comment to job form.');
      }
    } catch (error) {
      console.error('Error adding comment to job form:', error);
      toast.error('Failed to add comment to job form.');
    }
  };

  // Close the proposal modal
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProposal(null);
    setJobForms([]);
  };

  return (
    <div className="maintainer-page">
      <div className="mx col-span-12 max-w-3xl rounded-2xl border border-borderTr bg-morBg p-4 shadow sm:mx-auto sm:p-6">
        <Button type="primary" onClick={() => setIsExportModalVisible(true)}>
          Export Data
        </Button>

        <ExportDataModal
          isVisible={isExportModalVisible}
          onClose={() => setIsExportModalVisible(false)}
          categories={categories}
          type={type}
          setType={setType}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          handleExport={handleExport}
          isPending={isPending}
        />

        {categories.length > 0 ? (
          categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              fetchStandaloneJobDetails={fetchStandaloneJobDetails}
              fetchProposalDetails={fetchProposalDetails}
            />
          ))
        ) : (
          <p>No categories assigned to this wallet.</p>
        )}
      </div>

      <ProposalModal
        isVisible={isModalVisible}
        onClose={handleModalClose}
        proposal={selectedProposal}
        jobForms={jobForms}
        updating={updating}
        comment={comment}
        setComment={setComment}
        handleCommentSubmit={handleCommentSubmit}
        handleUpdateStatus={handleUpdateStatus}
        handleUpdateJobStatus={handleUpdateJobStatus}
        handleJobCommentSubmit={handleJobCommentSubmit}
        jobComments={jobComments}
        setJobComments={setJobComments}
      />

      <StandaloneJobModal
        isVisible={isStandaloneJobModalVisible}
        onClose={() => {
          setIsStandaloneJobModalVisible(false);
          setSelectedStandaloneJob(null);
        }}
        job={selectedStandaloneJob}
        updating={updating}
        comment={standaloneJobComment}
        setComment={setStandaloneJobComment}
        handleCommentSubmit={handleStandaloneJobCommentSubmit}
        handleUpdateStatus={handleUpdateStandaloneJobStatus}
      />
    </div>
  );
}
