import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { MapPin, Star, X,Stethoscope } from "lucide-react";

function Modal({
  isOpen,
  doctor,
  selectedDate,
  nextSevenDays,
  setSelectedDate,
  handleBookSlot,
  closeModal,
  doctorMetrics ,
}) {
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate loading time for a smooth transition effect
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSlotSelection = (index) => setSelectedSlotIndex(index);

  const slotStatusStyles = (status) =>
    status === "available"
      ? "bg-cyan-300 text-[#333333] hover:bg-cyan-400 transition-colors duration-200 ease-in-out cursor-pointer font-semibold"
      : "bg-gray-100 text-gray-400 cursor-not-allowed";

  if (!isOpen || !doctor) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 transform transition-transform duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Book an Appointment</h2>
          <button
            onClick={closeModal}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          // Loading Spinner
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          </div>
        ) : (
          // Modal Content
          <>
            {/* Doctor Info */}
            <div className="flex items-start space-x-4 mb-6">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shadow-md">
                {doctor.profilePictureUrl ? (
                  <img
                    src={doctor.profilePictureUrl}
                    alt={doctor.fullName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-xl font-semibold text-gray-600">
                    {doctor.fullName.split(" ").map((n) => n[0]).join("")}
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Dr. {doctor.fullName}
                </h3>
                <p className="text-sm text-gray-500">{doctor.specialization}</p>
                <div className="flex items-center space-x-1">
                  <Stethoscope  className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">{doctor.degrees ?? "N/A"}</span>
                  <span className="text-sm text-gray-500">• {doctor.phone ?? 0} </span>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{doctor.clinicAddress}</span>
                </div>
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-800">Select a date:</h4>
              <div className="flex overflow-x-auto space-x-2 py-2">
                {nextSevenDays.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`w-20 px-4 py-2 rounded-lg shadow-sm transition-all duration-200 ${
                      selectedDate === date
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-normal">{format(date, "EEE")}</div>
                      <div className="text-2xl font-bold">{format(date, "d")}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Available Slots */}
              {selectedDate && (
                <>
                  <h4 className="font-semibold mt-6 mb-2 text-gray-800">
                    Available Slots:
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {doctor.availableSlots.filter((slot) => slot.date === format(selectedDate, "yyyy-MM-dd")).length > 0 ? (
                      doctor.availableSlots
                        .filter((slot) => slot.date === format(selectedDate, "yyyy-MM-dd"))
                        .map((slot, index) => (
                          <button
                            key={index}
                            onClick={() => handleSlotSelection(index)}
                            className={`px-4 py-2 rounded-lg text-sm shadow-sm  ${slotStatusStyles(slot.status)}`}
                            disabled={slot.status !== "available"}
                          >
                            {slot.start} - {slot.end}
                          </button>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500">No available appointments.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Book Slot Button */}
            <button
              onClick={() => handleBookSlot(doctor.id, selectedSlotIndex)}
              disabled={selectedSlotIndex === null}
              className="w-full mt-6 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-all duration-200 disabled:bg-gray-300"
            >
              Book Slot
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Modal;
