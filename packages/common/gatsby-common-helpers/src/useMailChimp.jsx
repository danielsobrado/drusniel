import { useState } from 'react'

const useMailChimp = () => {
  const [result, setResult] = useState()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    const data = new FormData(e.target)
    const email = data.get('email')
    const { default: addToMailchimp } = await import('gatsby-plugin-mailchimp')
    const result = await addToMailchimp(email)
    setResult(result)
    setSubmitting(false)
  }

  const success = result && result.result === 'success'
  const error = result && result.result !== 'success'
  const canSubmit = !result || error
  const message = result && result.msg

  return {
    handleSubmit,
    canSubmit,
    submitting,
    message,
    success,
    error
  }
}

export default useMailChimp
