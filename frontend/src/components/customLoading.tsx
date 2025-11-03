import { Spinner } from './ui/spinner'

const CustomLoading = () => {
  return (
      <div className='w-full h-96 flex items-center justify-center'>
       <Spinner className="size-10 text-primary" />
      </div>
  )
}

export default CustomLoading;
