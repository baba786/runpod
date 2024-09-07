import { Input } from './ui/input'
import { Button } from './ui/button'

export function Form() {
  return (
    <form className="space-y-4">
      <Input
        type="text"
        placeholder="Enter your name"
        className="w-full px-4 py-2 text-base"
      />
      <Button type="submit" className="w-full sm:w-auto">
        Submit
      </Button>
    </form>
  )
}
