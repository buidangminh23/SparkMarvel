/**
 * Cau hinh site - chinh sua DUY NHAT o day.
 *
 * Lay access key mien phi tai: https://web3forms.com
 *  1. Nhap email nhan lead -> bam "Create Access Key"
 *  2. Copy key (dang UUID) va dan vao web3formsAccessKey ben duoi.
 *
 * Luu y: access key cua Web3Forms la PUBLIC submission key, duoc thiet ke
 * de dat o client. No chi cho phep gui form ve email da dang ky, khong lo
 * thong tin tai khoan -> an toan khi commit len git / deploy public.
 */
window.SPARK_CONFIG = Object.freeze({
  web3formsAccessKey: "YOUR_WEB3FORMS_ACCESS_KEY",
  formSubject: "Yêu cầu báo giá mới từ website SparkMarvel",
});
