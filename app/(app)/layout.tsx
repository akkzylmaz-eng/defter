import { Masthead } from "@/paper/frame/masthead";

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Masthead />
      <main>{children}</main>
    </>
  );
}
