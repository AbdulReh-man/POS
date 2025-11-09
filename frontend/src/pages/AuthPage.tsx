import { LoginForm } from "@/components/login-form";
import { SignupForm } from "@/components/signup-form";
import { CardContent } from "@/components/ui/card";
import { FieldDescription } from "@/components/ui/field";
import signupImage from "@/assets/f1.png";

export default function LoginPage() {
  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-4xl'>
        <LoginForm />
      </div>
    </div>
  );
}

// function SignupPage() {
//   return (
//     <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
//       <div className='w-full max-w-sm md:max-w-4xl'>
//         <SignupForm />
//       </div>
//     </div>
//   );
// }

// export { SignupPage };

function SignupPage() {
  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-4xl'>
        <CardContent className='grid md:grid-cols-2 p-0 border rounded-lg bg-background'>
          <div className='p-6 md:p-8'>
            <SignupForm />
          </div>
          <div className='bg-muted relative hidden md:block'>
            <img
              src={signupImage}
              alt='Signup'
              className='absolute inset-0 h-full w-full object-cover dark:brightness-75 dark:grayscale'
            />
          </div>
        </CardContent>
        <FieldDescription className='px-6 text-center mt-4!'>
          This System is Developed by Abdul Rehman &copy; 2026, All Rights
          Reserved.
          <a
            href='https://abdulrehmandev.me'
            target='_blank'
            rel='noopener noreferrer'>
            {" "}
            abdulrehman.dev
          </a>
        </FieldDescription>
      </div>
    </div>
  );
}

export { SignupPage };
