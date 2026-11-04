"use client";

import type { ButtonHTMLAttributes } from "react";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & { message: string };

/** 삭제처럼 되돌릴 수 없는 동작 전에 확인 창을 띄운다. */
export function ConfirmButton({ message, children, className = "", ...rest }: Props) {
  return (
    <button
      type="submit"
      className={`border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 ${className}`}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
