const generateOtp = () => {
  const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const otpLength = 6;
  return Array.from(
    { length: otpLength },
    () => str[Math.floor(Math.random() * str.length)]
  ).join("");
};

export default generateOtp;
