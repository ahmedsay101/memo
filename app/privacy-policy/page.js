'use client'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 font-arabic mb-8 text-center">
            سياسة الخصوصية
          </h1>
          
          <div className="space-y-6 font-arabic text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">مقدمة</h2>
              <p>
                في ميموز بيتزا، نحن ملتزمون بحماية خصوصية عملائنا الكرام. هذه السياسة توضح كيفية جمعنا واستخدامنا 
                وحماية معلوماتكم الشخصية عند استخدام موقعنا الإلكتروني أو خدماتنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-orange-600 mb-4 border-b-2 border-orange-200 pb-2">
                المعلومات التي نجمعها
              </h2>
              <div className="space-y-4">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">المعلومات الشخصية</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>الاسم الكامل</li>
                    <li>رقم الهاتف</li>
                    <li>العنوان (للتوصيل)</li>
                    <li>البريد الإلكتروني (اختياري)</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">معلومات الطلبات</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>تفاصيل المنتجات المطلوبة</li>
                    <li>تفضيلات الطعام والإضافات</li>
                    <li>وقت وتاريخ الطلب</li>
                    <li>طريقة الدفع المختارة</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">المعلومات التقنية</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>عنوان IP الخاص بجهازكم</li>
                    <li>نوع المتصفح والجهاز</li>
                    <li>أوقات زيارة الموقع</li>
                    <li>الصفحات التي تم زيارتها</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-teal-600 mb-4 border-b-2 border-teal-200 pb-2">
                كيفية استخدام معلوماتكم
              </h2>
              <div className="space-y-4">
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">معالجة الطلبات</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>تحضير وتوصيل طلباتكم</li>
                    <li>التواصل معكم بخصوص حالة الطلب</li>
                    <li>معالجة المدفوعات</li>
                    <li>تقديم خدمة العملاء</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">تحسين الخدمة</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>تطوير منتجات وخدمات جديدة</li>
                    <li>تحليل أنماط الطلب لتحسين المخزون</li>
                    <li>تحسين تجربة المستخدم على الموقع</li>
                    <li>إرسال عروض وخصومات مناسبة (بموافقتكم)</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-600 mb-4 border-b-2 border-blue-200 pb-2">
                مشاركة المعلومات
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-gray-800 mb-2">🔒 نحن لا نبيع أو نؤجر معلوماتكم الشخصية لأي طرف ثالث</h3>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">الحالات التي قد نشارك فيها المعلومات:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>شركاء التوصيل:</strong> مشاركة الاسم والعنوان لتوصيل الطلب</li>
                    <li><strong>مقدمي الخدمات المالية:</strong> معالجة المدفوعات عبر Paymob</li>
                    <li><strong>المتطلبات القانونية:</strong> عند طلب السلطات المختصة</li>
                    <li><strong>حماية حقوقنا:</strong> في حالات النزاع أو الاحتيال</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-red-600 mb-4 border-b-2 border-red-200 pb-2">
                أمان البيانات
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">التدابير الأمنية</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>تشفير جميع المعلومات الحساسة باستخدام SSL</li>
                    <li>حماية قواعد البيانات بكلمات مرور قوية</li>
                    <li>مراقبة منتظمة لأنشطة غير مصرح بها</li>
                    <li>تحديث دوري لأنظمة الحماية</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">أمان المدفوعات</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>استخدام بوابة Paymob الآمنة والمعتمدة</li>
                    <li>عدم تخزين معلومات البطاقات الائتمانية</li>
                    <li>تطبيق معايير PCI DSS للأمان</li>
                    <li>مراجعة دورية لعمليات الأمان</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-purple-600 mb-4 border-b-2 border-purple-200 pb-2">
                حقوقكم
              </h2>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">لديكم الحق في:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>الوصول:</strong> طلب نسخة من معلوماتكم المحفوظة لدينا</li>
                  <li><strong>التصحيح:</strong> طلب تعديل أي معلومات غير صحيحة</li>
                  <li><strong>الحذف:</strong> طلب حذف معلوماتكم الشخصية</li>
                  <li><strong>منع التسويق:</strong> إلغاء اشتراككم في رسائلنا التسويقية</li>
                  <li><strong>نقل البيانات:</strong> الحصول على نسخة قابلة للقراءة من معلوماتكم</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-green-600 mb-4 border-b-2 border-green-200 pb-2">
                ملفات تعريف الارتباط (Cookies)
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">نستخدم ملفات تعريف الارتباط لـ:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>حفظ محتويات سلة التسوق</li>
                    <li>تذكر تفضيلاتكم</li>
                    <li>تحسين أداء الموقع</li>
                    <li>تحليل استخدام الموقع</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600">
                  يمكنكم إزالة أو رفض ملفات تعريف الارتباط من خلال إعدادات المتصفح، لكن قد يؤثر ذلك على وظائف معينة في الموقع.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">الاتصال بنا</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-4">لأي استفسارات حول سياسة الخصوصية أو لممارسة حقوقكم، يرجى التواصل معنا عبر:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>الهاتف:</strong> 00201020207615</p>
                  </div>
                  <div>
                    <p><strong>البريد الإلكتروني:</strong> support@memos-pizza.com</p>
                    <p><strong>العنوان:</strong> أحد فروعنا المذكورة في الصفحة الرئيسية</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">تعديل السياسة</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p>
                  نحتفظ بالحق في تعديل هذه السياسة في أي وقت. سيتم إشعاركم بأي تغييرات جوهرية من خلال الموقع 
                  أو عبر البريد الإلكتروني (في حال توفره). استمراركم في استخدام خدماتنا بعد التعديل يعني موافقتكم 
                  على السياسة المحدثة.
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center font-arabic">
              آخر تحديث: 2 فبراير 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}