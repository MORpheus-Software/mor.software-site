import React from 'react';
import { classNames, escapeRegExp } from '@/utils/inputs';

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const defaultClassName = 'w-0 p-0 text-2xl bg-transparent';

export const NumericalInput = React.memo(
  ({
    value,
    onUserInput,
    placeholder,
    className = defaultClassName,
    ...rest
  }: {
    value: string | number;
    onUserInput: (input: string) => void;
    error?: boolean;
    fontSize?: string;
    align?: 'right' | 'left';
  } & Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'onChange' | 'as'>) => {
    const enforcer = (nextUserInput: string) => {
      if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
        onUserInput(nextUserInput);
      }
    };

    return (
      <div className="relative w-full">
        <input
          {...rest}
          value={value}
          onChange={(event) => {
            // replace commas with periods, because Uniswap exclusively uses period as the decimal separator
            enforcer(event.target.value.replace(/,/g, '.'));
          }}
          // universal input options
          inputMode="decimal"
          title="Token Amount"
          autoComplete="off"
          autoCorrect="off"
          // text-specific options
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          placeholder={placeholder || '0.0'}
          min={0}
          minLength={1}
          maxLength={79}
          spellCheck="false"
          className={classNames(
            'placeholder-low-emphesis relative flex-auto overflow-hidden overflow-ellipsis font-bold outline-none focus:ring-1 focus:ring-activeRing',
            className,
          )}
        />
      </div>
    );
  },
);

NumericalInput.displayName = 'NumericalInput';

export default NumericalInput;

// const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`) // match escaped "." characters via in a non-capturing group
