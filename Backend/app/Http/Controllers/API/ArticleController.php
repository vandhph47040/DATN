<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ArticleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $article = Article::query()->latest('id')->get();

        return response()->json($article, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|unique:article|max:255',
            'author' => 'nullable',
            'category' => 'required',
            'body' => 'required',
            'status' => 'required|in:Active,InActive',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $data = $request->all();

        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $imagePath = $data['image']->store('image', 'public');
            $data['image'] = Storage::url($imagePath);
        }

        $article = Article::query()->create($data);

        return response()->json(
            ['message' => 'Tạo bài viết thành công', 'data' => $article],
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $article = Article::query()->findOrFail($id);

        if (!$article) {
            return response()->json(['message' => 'Bài viết không tồn tại hoặc đã bị xóa'], 404);
        }

        return response()->json($article, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $article = Article::query()->findOrFail($id);

        if (!$article) {
            return response()->json(['message' => 'Bài viết không tồn tại hoặc đã bị xóa'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|unique:article,title,' . $id,
            'author' => 'nullable',
            'category' => 'required',
            'body' => 'required',
            'status' => 'required|in:Active,InActive',
            'image' => 'nullable',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 422);
        }

        $data = $request->all();

        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $imagePath = $data['image']->store('image', 'public');
            $data['image'] = Storage::url($imagePath);
        }

        $article->update($data);

        return response()->json([
            'message' => 'Cập nhật bài viết thành công',
            'data' => $article
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //Tìm bài viết theo id
        $article = Article::query()->findOrFail($id);

        if (!$article) {
            return response()->json(['message' => 'Bài viết không tồn tại hoặc đã bị xóa'], 404);
        }

        $article->delete();

        return response()->json(['message' => 'Bài viết đã được xóa'], 200);
    }
}
