import numbro from "numbro";
import { parseUnits as ethersParse } from "ethers";
import { sepoliaExplorerURL } from "../constants/misc";
import { ethers } from "ethers";

export const formatDollarAmount = (
  num: number | undefined | null,
  digits = 2,
  round = true
) => {
  if (num === 0) return "$0.00";
  if (!num) return "$";
  if (num < 0.001 && digits <= 3) {
    return "<$0.001";
  }
  if (num < 0.01 && digits <= 2) {
    return "<$0.01";
  }

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: "M",
      billion: "B",
    },
  });
};

export function formatNumberScale(number: any, usd = false, decimals = 2) {
  if (isNaN(number) || number === "" || number === undefined) {
    return usd ? "$0.00" : "0";
  }
  const num = parseFloat(number);
  const fullNum = Math.floor(num).toLocaleString("fullwide", {
    useGrouping: false,
  });
  const wholeNumberLength = fullNum.length;

  if (wholeNumberLength >= 19) return usd ? "> $1000 Q" : "> 1000 Q";
  if (wholeNumberLength >= 16)
    return (usd ? "$" : "") + (num / Math.pow(10, 15)).toFixed(decimals) + " Q";
  if (wholeNumberLength >= 13)
    return (usd ? "$" : "") + (num / Math.pow(10, 12)).toFixed(decimals) + " T";
  if (wholeNumberLength >= 10)
    return (usd ? "$" : "") + (num / Math.pow(10, 9)).toFixed(decimals) + " B";
  if (wholeNumberLength >= 7)
    return (usd ? "$" : "") + (num / Math.pow(10, 6)).toFixed(decimals) + " M";
  if (wholeNumberLength >= 4)
    return (usd ? "$" : "") + (num / Math.pow(10, 3)).toFixed(decimals) + " K";

  if (num < 0.0001 && num > 0) {
    return usd ? "< $0.0001" : "< 0.0001";
  }

  return (usd ? "$" : "") + num.toFixed(decimals);
}

export const formatTokenAmount = (num: number | undefined, digits = 2) => {
  if (num === 0) return "0";
  if (!num) return "0";
  if (num < 0.001 && digits <= 3) {
    return "<0.001";
  }
  if (num < 0.01 && digits <= 2) {
    return "<0.01";
  }

  let formattedAmount = numbro(num)
    .formatCurrency({
      average: true,
      mantissa: num >= 1000 ? 2 : digits,
      abbreviations: {
        million: "M",
        billion: "B",
      },
    })
    .replace("$", "");

  formattedAmount = formattedAmount.replace(".00", "");
  return formattedAmount;
};

export function parseUnits(_num: number) {
  return ethersParse(_num.toString(), 9);
}

export function formatUnits(_num: any) {
  return typeof _num === "number"
    ? _num / 1e18
    : parseFloat(_num.toString()) / 1e18;
}

export const generateExplorerTxLink = (txId?: string) => {
  return `${sepoliaExplorerURL}/tx/${txId}`;
};

export const truncateDigits = (num: number) => {
  return Math.floor(num * 100) / 100;
};

export const exactAmountInDecimals = (amount: number) => {
  return Number.isInteger(amount)
    ? amount.toString()
    : amount.toFixed(18).replace(/0+$/, "");
};
