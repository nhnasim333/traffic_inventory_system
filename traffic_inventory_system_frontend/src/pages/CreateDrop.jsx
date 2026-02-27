import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCreateDropMutation } from "@/redux/features/drops/dropsApi";

const CreateDrop = () => {
  const { register, handleSubmit, reset } = useForm();
  const [createDrop, { isLoading }] = useCreateDropMutation();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const toastId = toast.loading("Creating drop...");
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        totalStock: Number(data.totalStock),
        dropStartsAt: new Date(data.dropStartsAt).toISOString(),
      };
      if (data.imageUrl?.trim()) {
        payload.imageUrl = data.imageUrl.trim();
      }

      await createDrop(payload).unwrap();
      toast.success("Drop created successfully!", {
        id: toastId,
        duration: 2000,
      });
      reset();
      navigate("/");
    } catch (error) {
      const message = error?.data?.message || "Failed to create drop";
      toast.error(message, { id: toastId, duration: 3000 });
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Create New Drop
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sneaker Name *
            </label>
            <input
              {...register("name", { required: true })}
              id="name"
              type="text"
              placeholder="e.g. Air Jordan 1 Retro High OG"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description *
            </label>
            <textarea
              {...register("description", { required: true })}
              id="description"
              placeholder="Brief description of the sneaker"
              required
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price ($) *
              </label>
              <input
                {...register("price", { required: true, min: 0.01 })}
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="170.00"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="totalStock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Total Stock *
              </label>
              <input
                {...register("totalStock", { required: true, min: 1 })}
                id="totalStock"
                type="number"
                min="1"
                placeholder="50"
                required
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="dropStartsAt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Drop Starts At *
            </label>
            <input
              {...register("dropStartsAt", { required: true })}
              id="dropStartsAt"
              type="datetime-local"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Image URL (optional)
            </label>
            <input
              {...register("imageUrl")}
              id="imageUrl"
              type="url"
              placeholder="https://example.com/sneaker.jpg"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Drop"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDrop;
