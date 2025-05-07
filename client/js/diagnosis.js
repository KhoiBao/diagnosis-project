document.addEventListener('DOMContentLoaded', function() {
    const diagnosisForm = document.getElementById('diagnosisForm');
    const resultContainer = document.getElementById('resultContainer');
    const resultContent = document.getElementById('resultContent');
    
    diagnosisForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        showLoading();

        setTimeout(fetchDiagnosisResult, 2000); 
    });
    
    function validateForm() {
        const age = document.getElementById('age').value;
        const bmi = document.getElementById('bmi').value;
        const bloodPressure = document.getElementById('blood_pressure').value;
        const skinThickness = document.getElementById('skin_thickness').value;
        const glucose = document.getElementById('glucose').value;
        const insulin = document.getElementById('insulin').value;
        const diabetesPedigreeFunction = document.getElementById('diabetesPedigreeFunction').value;
        const pregnancies = document.getElementById('pregnancies').value;
    
        if (
            !age || !bmi || !bloodPressure || !skinThickness ||
            !glucose || !insulin || !diabetesPedigreeFunction || !pregnancies
        ) {
            alert('Vui lòng điền đầy đủ tất cả các trường thông tin.');
            return false;
        }
    
        return true;
    }
    
    function showLoading() {
        resultContainer.classList.remove('hidden');
        resultContent.innerHTML = `
            <div class="flex justify-center items-center py-4">
                <svg class="animate-spin h-8 w-8 text-primary light:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="ml-3 text-gray-700 light:text-gray-300">Đang phân tích dữ liệu...</span>
            </div>
        `;
    }
    
    function fetchDiagnosisResult() {
        fetch('http://127.0.0.1:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                pregnancies: parseInt(document.getElementById('pregnancies').value),
                glucose: parseInt(document.getElementById('glucose').value),
                blood_pressure: parseInt(document.getElementById('blood_pressure').value),
                skin_thickness: parseInt(document.getElementById('skin_thickness').value),
                insulin: parseInt(document.getElementById('insulin').value),
                bmi: parseFloat(document.getElementById('bmi').value),
                diabetes_pedigree: parseFloat(document.getElementById('diabetesPedigreeFunction').value),
                age: parseInt(document.getElementById('age').value)
            }),
        })
        .then(response => {
            console.log("Response object:", response);
            if (!response.ok) {
                throw new Error("Phản hồi không hợp lệ từ server");
            }
            return response.json();
        })
        .then(data => {
            console.log("Data nhận về:", data);
            displayResult(data);  
        })
        .catch(error => {
            console.error("Có lỗi xảy ra:", error);
            resultContent.innerHTML = `
                <div class="p-4 bg-red-50 light:bg-red-900/30 rounded-lg text-red-600 light:text-red-400">
                    Đã xảy ra lỗi trong quá trình chẩn đoán. Vui lòng thử lại sau.
                </div>
            `;
        });
    }
    
    function displayResult(data) {
        const percentage = data.risk_percentage;
        let riskLevel = '';
        let riskClass = '';
        let riskDescription = '';
        let recommendation = '';
    
        if (percentage >= 75) {
            // Mức NGUY CƠ CAO
            riskLevel = "RẤT CAO";
            riskClass = "text-red-700 light:text-red-400";
            riskDescription = `
                Hệ thống chẩn đoán bạn có <strong>${percentage}%</strong> khả năng mắc bệnh <strong>TIỂU ĐƯỜNG</strong>.
                Đây là <strong class="uppercase">cảnh báo y tế nghiêm trọng</strong>. Nếu không điều trị sớm, bệnh tiểu đường có thể dẫn đến:
                <ul class="list-disc pl-5 mt-2 text-sm">
                    <li>Mù lòa</li>
                    <li>Suy thận, phải chạy thận nhân tạo</li>
                    <li>Hoại tử chi, nguy cơ đoạn chi</li>
                    <li>Đột quỵ hoặc nhồi máu cơ tim</li>
                </ul>
            `;
            recommendation = `
                <div class="mt-4 p-4 bg-red-100 light:bg-red-900/30 rounded-lg text-red-800 light:text-red-300 border border-red-400 light:border-red-600">
                    🚨 <strong>Khuyến nghị khẩn cấp:</strong> Vui lòng đến bệnh viện chuyên khoa nội tiết để làm xét nghiệm đường huyết, HbA1c và được tư vấn điều trị. Không được chủ quan!
                </div>
            `;
        } else if (percentage >= 50) {
            // Mức NGUY CƠ TRUNG BÌNH
            riskLevel = "TRUNG BÌNH";
            riskClass = "text-orange-600 light:text-orange-400";
            riskDescription = `
                Hệ thống cho thấy bạn có <strong>${percentage}%</strong> nguy cơ mắc bệnh tiểu đường. 
                Bạn hiện đang ở <strong>giai đoạn tiền tiểu đường</strong> – nếu không điều chỉnh lối sống, bệnh có thể phát triển âm thầm và gây biến chứng sau vài năm.
            `;
            recommendation = `
                <div class="mt-4 p-4 bg-orange-100 light:bg-orange-900/30 rounded-lg text-orange-800 light:text-orange-300 border border-orange-400 light:border-orange-600">
                    ⚠️ <strong>Khuyến nghị:</strong> Hạn chế đường, tinh bột, nước ngọt và bắt đầu tập luyện đều đặn mỗi ngày. Theo dõi đường huyết ít nhất mỗi 3 tháng.
                </div>
            `;
        } else {
            // Mức THẤP
            riskLevel = "THẤP";
            riskClass = "text-green-600 light:text-green-400";
            riskDescription = `
                Bạn chỉ có <strong>${percentage}%</strong> nguy cơ mắc bệnh tiểu đường. Đây là dấu hiệu tích cực, 
                nhưng vẫn cần duy trì lối sống lành mạnh vì tiểu đường có thể phát sinh do tuổi tác, di truyền và thói quen xấu kéo dài.
            `;
            recommendation = `
                <div class="mt-4 p-4 bg-green-100 light:bg-green-900/30 rounded-lg text-green-800 light:text-green-300 border border-green-400 light:border-green-600">
                    ✅ <strong>Lời khuyên:</strong> Tiếp tục duy trì ăn uống khoa học, tập thể dục, và khám sức khỏe định kỳ.
                </div>
            `;
        }
    
        resultContent.innerHTML = `
            <div class="mb-6 text-center">
                <div class="inline-block rounded-full bg-gray-100 light:bg-gray-700 p-3 mb-3">
                    <svg class="h-8 w-8 ${riskClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h4 class="text-lg font-semibold mb-1">
                    Nguy cơ tiểu đường: <span class="${riskClass}">${riskLevel}</span>
                </h4>
            </div>
            <p class="text-gray-700 light:text-gray-300 mb-4">${riskDescription}</p>
            ${recommendation}
        `;
    }
    
});
