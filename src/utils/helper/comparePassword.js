import bcrypt from "bcryptjs";

const comparePassword = (plain, hashed) =>
  new Promise((resolve, reject) => {
    bcrypt.compare(plain, hashed, (err, isMatch) => {
      if (err) {
        reject(err);
      }
      resolve(isMatch);
    });
  });

export default comparePassword;
