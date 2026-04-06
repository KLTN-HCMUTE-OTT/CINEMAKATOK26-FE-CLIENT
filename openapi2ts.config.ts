/* eslint-disable import/no-anonymous-default-export */
export default {
  // 🔹 Đường dẫn tới file OpenAPI/Swagger JSON của backend
  schemaPath: "http://localhost:3000/api/docs-json", // hoặc ./swagger.json nếu dùng file local

  // 🔹 Thư mục chứa code API sinh ra
  serversPath: "./src/apis",
  requestLibPath: "import request from '@/lib/request'",

  // 🔹 Tùy chọn sinh code
  generateOptions: {
    generateApi: true,
  },
};
