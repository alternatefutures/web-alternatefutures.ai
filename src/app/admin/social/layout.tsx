import SocialSubNav from './SocialSubNav'

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SocialSubNav />
      {children}
    </>
  )
}
