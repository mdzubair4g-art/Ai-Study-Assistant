function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition">

      <div className="text-4xl mb-4">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-gray-900">
        {title}
      </h3>

      <p className="mt-3 text-gray-600">
        {description}
      </p>

    </div>
  );
}

export default FeatureCard;