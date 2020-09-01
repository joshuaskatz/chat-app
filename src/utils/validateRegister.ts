import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "Invalid email",
      },
    ];
  }
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "Cannot include @",
      },
    ];
  }
  if (options.username.length <= 5) {
    return [
      {
        field: "username",
        message: "Length must be at least 6 characters.",
      },
    ];
  }
  if (options.password.length <= 7) {
    return [
      {
        field: "password",
        message: "Length must be at least 8 characters.",
      },
    ];
  }

  return null;
};
