"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit3, ExternalLink } from "lucide-react";
import { BLOG_CATEGORIES, blogCategoryName } from "@/lib/blog";

interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  category: string;
  tags?: string | null;
  authorName: string;
  status: string;
  viewCount: number;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function BlogAdminClient({ posts }: { posts: Post[] }) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <p className="text-xs text-navy-500">
          총 {posts.length}개의 포스트 (게시 {posts.filter((p) => p.status === "PUBLISHED").length}개)
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
          className="btn-primary !py-2 !px-3 text-xs"
        >
          + 새 포스트
        </button>
      </div>

      {(creating || editing) && (
        <PostForm
          post={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <div className="card overflow-x-auto">
        {posts.length === 0 ? (
          <p className="py-8 text-center text-sm text-navy-500">
            아직 포스트가 없습니다.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-left text-xs text-navy-500">
                <th className="py-2 font-medium">상태</th>
                <th className="py-2 font-medium">제목</th>
                <th className="py-2 font-medium">카테고리</th>
                <th className="py-2 font-medium">조회</th>
                <th className="py-2 font-medium">게시일</th>
                <th className="py-2 font-medium">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {posts.map((p) => (
                <PostRow key={p.id} post={p} onEdit={() => setEditing(p)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PostRow({
  post,
  onEdit,
}: {
  post: Post;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!confirm(`"${post.title}" 포스트를 삭제하시겠습니까?`)) return;
    setBusy(true);
    const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function toggleStatus() {
    const next = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    setBusy(true);
    const res = await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <tr>
      <td className="py-3">
        <button
          onClick={toggleStatus}
          disabled={busy}
          className={
            post.status === "PUBLISHED"
              ? "rounded-full bg-mint-500 px-2 py-0.5 text-[10px] font-bold text-white"
              : post.status === "DRAFT"
              ? "rounded-full bg-navy-200 px-2 py-0.5 text-[10px] font-bold text-navy-700"
              : "rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-bold text-navy-500"
          }
        >
          {post.status}
        </button>
      </td>
      <td className="py-3 max-w-xs">
        <div className="font-medium text-navy-900 line-clamp-1">{post.title}</div>
        <div className="text-[11px] text-navy-500 line-clamp-1">/blog/{post.slug}</div>
      </td>
      <td className="py-3 text-navy-700 text-xs">
        {blogCategoryName(post.category)}
      </td>
      <td className="py-3 text-navy-700 text-xs">
        {post.viewCount.toLocaleString()}
      </td>
      <td className="py-3 text-navy-500 text-xs">
        {post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString("ko-KR")
          : "—"}
      </td>
      <td className="py-3">
        <div className="flex gap-1">
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            className="rounded-md bg-navy-100 p-1.5 text-navy-700 hover:bg-navy-200"
            title="미리보기"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={onEdit}
            className="rounded-md bg-navy-100 p-1.5 text-navy-700 hover:bg-navy-200"
            title="수정"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={remove}
            disabled={busy}
            className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100 disabled:opacity-50"
            title="삭제"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PostForm({
  post,
  onClose,
}: {
  post: Post | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      title: String(fd.get("title") ?? ""),
      slug: String(fd.get("slug") ?? "") || undefined,
      excerpt: String(fd.get("excerpt") ?? ""),
      content: String(fd.get("content") ?? ""),
      coverImageUrl: String(fd.get("coverImageUrl") ?? "") || null,
      category: String(fd.get("category") ?? "MARKET_ANALYSIS"),
      tags: String(fd.get("tags") ?? "") || null,
      status: String(fd.get("status") ?? "PUBLISHED"),
    };

    const url = post
      ? `/api/admin/blog/${post.id}`
      : "/api/admin/blog";
    const method = post ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusy(false);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.message ?? "저장 실패");
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mb-6 grid gap-3 md:grid-cols-2">
      <h3 className="md:col-span-2 text-base font-bold text-navy-900">
        {post ? "포스트 수정" : "새 포스트 작성"}
      </h3>

      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-navy-800">제목</span>
        <input
          name="title"
          required
          defaultValue={post?.title ?? ""}
          maxLength={160}
          className="input"
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-navy-800">
          슬러그 (생략 시 자동)
        </span>
        <input
          name="slug"
          defaultValue={post?.slug ?? ""}
          maxLength={80}
          className="input"
          placeholder="my-post-slug"
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-navy-800">카테고리</span>
        <select
          name="category"
          defaultValue={post?.category ?? "MARKET_ANALYSIS"}
          className="input"
        >
          {BLOG_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-navy-800">요약</span>
        <input
          name="excerpt"
          required
          defaultValue={post?.excerpt ?? ""}
          maxLength={300}
          className="input"
          placeholder="목록·SNS 공유 시 표시될 한 줄"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-navy-800">
          커버 이미지 URL (선택)
        </span>
        <input
          name="coverImageUrl"
          type="url"
          defaultValue={post?.coverImageUrl ?? ""}
          maxLength={500}
          className="input"
          placeholder="https://..."
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-navy-800">
          태그 (쉼표 구분)
        </span>
        <input
          name="tags"
          defaultValue={post?.tags ?? ""}
          maxLength={200}
          className="input"
          placeholder="코스피, 단타, 반도체"
        />
      </label>
      <label>
        <span className="mb-1 block text-xs font-medium text-navy-800">상태</span>
        <select
          name="status"
          defaultValue={post?.status ?? "PUBLISHED"}
          className="input"
        >
          <option value="DRAFT">DRAFT (미공개)</option>
          <option value="PUBLISHED">PUBLISHED (게시)</option>
          <option value="ARCHIVED">ARCHIVED (보관)</option>
        </select>
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-xs font-medium text-navy-800">
          본문 (HTML 허용)
        </span>
        <textarea
          name="content"
          required
          rows={12}
          defaultValue={post?.content ?? ""}
          className="input font-mono text-xs"
          placeholder="<h2>섹션 제목</h2><p>본문...</p>"
        />
      </label>

      {error && (
        <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="md:col-span-2 flex gap-2">
        <button type="submit" disabled={busy} className="btn-primary !py-2 !px-4 text-xs">
          {busy ? "저장 중..." : post ? "수정 저장" : "포스트 생성"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary !py-2 !px-4 text-xs"
        >
          취소
        </button>
      </div>
    </form>
  );
}
