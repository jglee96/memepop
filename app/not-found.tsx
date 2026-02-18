import Link from "next/link";

export default function NotFoundPage(): React.JSX.Element {
  return (
    <main className="card">
      <h1 style={{ marginTop: 0 }}>페이지를 찾을 수 없습니다.</h1>
      <p className="muted">요청한 밈 slug가 등록되어 있지 않거나 주소가 잘못되었습니다.</p>
      <Link href="/memes" className="btn btn-primary" style={{ display: "inline-block", marginTop: "0.6rem" }}>
        밈 목록으로 이동
      </Link>
    </main>
  );
}
