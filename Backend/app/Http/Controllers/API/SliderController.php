<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SliderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sliders = Slider::latest('id')->get();
        return response()->json([
            'success' => true,
            'data' => $sliders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|max:2048',
            // 'is_active' => 'boolean'
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('sliders', 'public');
            $validated['image_path'] = $path;
        }

        $validated['is_active'] = $request->has('is_active') ? 1 : 0;
        $slider = Slider::create($validated);

        return response()->json([
            'success' => true,
            'data' => $slider,
            'message' => 'Slider created successfully'
        ], 201);
    }


    public function update(Request $request, Slider $slider)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|max:2048',
            // 'is_active' => 'boolean'
        ]);

        if ($request->hasFile('image')) {
            Storage::disk('public')->delete($slider->image_path);
            $path = $request->file('image')->store('sliders', 'public');
            $validated['image_path'] = $path;
        }

        $validated['is_active'] = $request->has('is_active') ? 1 : 0;
        $slider->update($validated);

        return response()->json([
            'success' => true,
            'data' => $slider,
            'message' => 'Slider updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) // Thay Slider $slider bằng $id
    {
        $slider = Slider::findOrFail($id); // Tìm slider theo ID

        Storage::disk('public')->delete($slider->image_path);
        $slider->delete();

        return response()->json([
            'success' => true,
            'message' => 'Slider deleted successfully'
        ], 204);
    }

    public function getActiveSliders()
    {
        $sliders = Slider::where('is_active', true)
            ->get()
            ->map(function ($slider) {
                // Thêm full URL cho image_path
                $slider->image_url = Storage::disk('public')->url($slider->image_path);
                return $slider;
            });

        return response()->json([
            'success' => true,
            'data' => $sliders
        ]);
    }
}
