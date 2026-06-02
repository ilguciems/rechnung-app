import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "danger" | "info";

type ButtonSize = "small" | "medium" | "full" | "large";

type ButtonType = "submit" | "button";

type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const variantClasses = {
    primary: `bg-gray-950 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200`,
    secondary: `bg-gray-600 text-white hover:bg-gray-700`,
    danger: `bg-red-600 text-white hover:bg-red-700`,
    info: `bg-blue-500 text-white hover:bg-blue-600`,
  };

  const sizeClasses = {
    small: "text-sm py-1 px-2",
    medium: "text-base py-2 px-4",
    full: "w-full",
    large: "text-lg py-3 px-6",
  };

  const baseClasses = `rounded-md font-medium transition-colors duration-300 py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer 
  ${disabled ? "opacity-50 cursor-not-allowed!" : ""}`;

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  href,
  variant = "primary",
  size = "medium",
}: ButtonProps & { href: string }) {
  const variantClasses = {
    primary: `py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer bg-gray-950 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200`,
    secondary: `py-2 px-4 rounded-md font-medium text-sm transition-colors text-center duration-200
                               bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700`,
    danger: `py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer bg-red-600 text-white hover:bg-red-700`,
    info: `py-2 px-4 rounded-md font-medium text-sm transition-colors duration-200 cursor-pointer bg-blue-500 text-white hover:bg-blue-600`,
  };

  const sizeClasses = {
    small: "text-sm py-1 px-2",
    medium: "text-base py-2 px-4",
    full: "w-full",
    large: "text-lg py-3 px-6",
  };

  const baseClasses = "rounded-md font-medium transition-colors duration-300";

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
