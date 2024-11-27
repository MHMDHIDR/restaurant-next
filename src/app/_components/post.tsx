"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";

export function LatestPost() {
  const [latestPosts] = api.post.getLatest.useSuspenseQuery();
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
      setError("");
    },
    onError: (error) => {
      if (error.data?.zodError) {
        const fieldErrors = error.data.zodError.fieldErrors;
        setError(fieldErrors.name?.[0] ?? "Invalid input");
      } else {
        setError(error.message);
      }
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.getLatest.invalidate();
      setDeletingId(null);
    },
  });

  const handleDelete = (postId: number, postName: string) => {
    if (
      confirm(
        `Are you sure you want to delete ${postName}?\nThis action is irreversible!`,
      )
    ) {
      setDeletingId(postId);
      deletePost.mutate(postId);
    }
  };

  const handleCreatePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    createPost.mutate({ name });
  };

  return (
    <div className="w-full max-w-xs space-y-10">
      {latestPosts ? (
        <div className="flex flex-col items-start gap-2">
          {latestPosts.map((post) => {
            const POST_NAME = post.name;
            const MAX_POST_NAME = 50;

            return (
              <article
                key={post.id}
                className="flex min-w-full flex-col rounded-xl bg-transparent/40 p-4"
              >
                <div className="flex justify-between gap-x-2">
                  <p className="text-2xl text-white">
                    {POST_NAME.slice(0, MAX_POST_NAME)}
                    {POST_NAME.length > MAX_POST_NAME ? "..." : ""}
                  </p>
                  <button
                    onClick={() => handleDelete(post.id, POST_NAME)}
                    className="h-fit rounded-full bg-white/10 px-4 py-2 font-semibold transition hover:bg-red-700/50"
                    disabled={deletingId === post.id}
                  >
                    {deletingId === post.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
                <span className="text-white/50">
                  At: {new Date(post.createdAt).toDateString()}
                </span>
              </article>
            );
          })}
        </div>
      ) : (
        <p>You have no posts yet.</p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleCreatePost} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-full px-4 py-2 text-black"
        />
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createPost.isPending}
        >
          {createPost.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
