import CommunitySubNav from './CommunitySubNav'

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CommunitySubNav />
      {children}
    </>
  )
}
