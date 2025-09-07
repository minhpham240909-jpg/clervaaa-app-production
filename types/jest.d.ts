import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | number | string[]): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, any>): R;
      toHaveDisplayValue(value: string | string[]): R;
      toBeEmpty(): R;
      toBeEmptyDOMElement(): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveAccessibleName(name: string): R;
      toHaveAccessibleDescription(description: string): R;
      toHaveErrorMessage(text: string | RegExp): R;
    }
  }
}

export {};
