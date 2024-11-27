import {
  Description,
  Dialog,
  DialogPanel,
  Field,
  Input,
  Label,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRegisterMutation } from "../../../redux/features/auth/authApi";
import { toast } from "sonner";
import Loading from "../Loading";

const schema = Yup.object().shape({
  username: Yup.string().required("Please enter your name!"),
  email: Yup.string()
    .email("Invalid email!")
    .required("Please enter your email!"),
  password: Yup.string()
    .required("Please enter your password!")
    .min(6, "Password must be atleast 6 characters!"),
});

const Register = ({ registered, setLogin, setRegister }) => {
  const [visible, setVisible] = useState(false);
  const [register, { data, error, isSuccess, isLoading }] =
    useRegisterMutation();

  useEffect(() => {
    if (isSuccess) {
      const message = data.message || "Registration successful";
      toast.success(message);
      setRegister(false);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  const formik = useFormik({
    initialValues: { username: "", email: "", password: "" },
    validationSchema: schema,
    onSubmit: async ({ username, email, password }) => {
      const data = {
        username,
        email,
        password,
      };
      await register(data);
    },
  });

  const { errors, touched, values, handleChange, handleSubmit } = formik;

  return (
    <Dialog open={registered} onClose={() => setRegister(false)}>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <DialogPanel className="relative bg-white  dark:bg-[#2d2c2c] p-6 rounded-lg shadow-lg w-full max-w-md">
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-800 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-200"
              onClick={() => setRegister(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-bold mb-6 font-Josefin text-black dark:text-white">
              Register
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="w-full max-w-md">
                <Field>
                  <Label className="text-sm/6 font-medium text-black dark:text-white">
                    Username
                  </Label>
                  <Input
                    className={`mt-2 block w-full rounded-lg border bg-white/5 py-1.5 px-3 text-sm/6 text-black dark:text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 dark:data-[focus]:outline-white/25 data-[focus]:outline-black/25 ${
                      errors.username && touched.username && "border-red-500"
                    }`}
                    id="username"
                    value={values.username}
                    onChange={handleChange}
                    placeholder="John Doe"
                    autoComplete="off"
                  />
                  {errors.username && touched.username && (
                    <span className="text-red-500 pt-2 block">
                      {errors.username}
                    </span>
                  )}
                </Field>
              </div>
              <div className="w-full max-w-md mt-3">
                <Field>
                  <Label className="text-sm/6 font-medium text-black dark:text-white">
                    Email
                  </Label>
                  <Input
                    className={`mt-2 block w-full rounded-lg border bg-white/5 py-1.5 px-3 text-sm/6 text-black dark:text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 dark:data-[focus]:outline-white/25 data-[focus]:outline-black/25 ${
                      errors.email && touched.email && "border-red-500"
                    }`}
                    type="email"
                    id="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="john@doe.com"
                    autoComplete="off"
                  />
                  {errors.email && touched.email && (
                    <span className="text-red-500 pt-2 block">
                      {errors.email}
                    </span>
                  )}
                </Field>
              </div>
              <div className="w-full max-w-md mt-3 relative">
                <Field>
                  <Label className="text-sm/6 font-medium text-black dark:text-white">
                    Password
                  </Label>
                  <Input
                    className={`mt-2 block w-full rounded-lg border bg-white/5 py-1.5 px-3 text-sm/6 text-black dark:text-white focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 dark:data-[focus]:outline-white/25 data-[focus]:outline-black/25 ${
                      errors.password && touched.password && "border-red-500"
                    }`}
                    type={visible ? "text" : "password"}
                    id="password"
                    value={values.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    autoComplete="off"
                  />
                  <div
                    className={`absolute right-3 transform -translate-y-1/2 cursor-pointer ${
                      errors.password && touched.password
                        ? "top-2/4"
                        : "top-3/4"
                    }`}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? (
                      <VscEyeClosed className="text-gray-500" size={20} />
                    ) : (
                      <VscEye className="text-gray-500" size={20} />
                    )}
                  </div>
                  {errors.password && touched.password && (
                    <span className="text-red-500 pt-2 block">
                      {errors.password}
                    </span>
                  )}
                </Field>
              </div>
              <button
                type="submit"
                className="mt-5 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
              >
                Register
              </button>
            </form>

            {/* <div className="flex items-center pt-6">
              <div className="w-full border h-1/4 border-gray-300 dark:border-gray-500" />
              <h5 className="w-full text-center font-Poppins text-sm text-gray-300 dark:text-gray-500">
                Or join with
              </h5>
              <div className="w-full border h-1/4 border-gray-300 dark:border-gray-500" />
            </div>
            <div className="flex items-center justify-center my-3 gap-4">
              <FcGoogle
                size={30}
                className="cursor-pointer"
                onClick={() => signIn("google")}
              />
              <AiFillGithub
                size={30}
                className="cursor-pointer text-black dark:text-white"
                onClick={() => signIn("github")}
              />
            </div> */}

            <Description className="font-Josefin text-black dark:text-white mt-8">
              Already have an account?{" "}
              <span
                className="text-blue-600 dark:text-blue-400 cursor-pointer"
                onClick={() => {
                  setRegister(false);
                  setLogin(true);
                }}
              >
                Login
              </span>
            </Description>
          </DialogPanel>
        </div>
      )}
    </Dialog>
  );
};

export default Register;
