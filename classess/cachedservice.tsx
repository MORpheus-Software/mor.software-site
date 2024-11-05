import { toast, ToastOptions } from 'react-toastify';
import { CheckCheck, CheckIcon, FileWarningIcon, AlertCircleIcon } from 'lucide-react';

const commonToastConfig: Partial<ToastOptions> = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  progress: undefined,
  draggable: false,
  closeButton: false,
  icon: false,
};

class Cache {
  errorToast = (text: string | JSX.Element, options?: ToastOptions<{}>) =>
    toast.error(text, {
      ...commonToastConfig,
      style: {
        background: '#000',
        border: '1px solid #ffffff57',
      },
      ...options,
    });

  TxProgressToast = (text: string | JSX.Element, options?: ToastOptions<{}>) =>
    toast.error(text, {
      ...commonToastConfig,
      // icon: () => <CheckIcon size={24} />, // Adjust size as needed
      style: {
        background: '#000',
        border: '1px solid #ffffff57',
      },
      autoClose: false,
      ...options,
    });

  warningToast = (text: string | JSX.Element, options?: ToastOptions<{}>) =>
    toast.warning(text, {
      ...commonToastConfig,
      icon: () => <AlertCircleIcon size={24} />, // Adjust size as needed
      style: {
        background: '#27360d',
      },
      ...options,
    });

  successToast = (text: string | JSX.Element, options?: ToastOptions<{}>) =>
    toast.success(text, {
      ...commonToastConfig,
      // icon: () => <CheckCheck size={24} />, // Adjust size as needed
      style: {
        background: '#000',
        border: '1px solid #ffffff57',
      },
      autoClose: false,
      ...options,
    });
}

const CachedService = new Cache();

export default CachedService;
