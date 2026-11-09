package com.tvu.quanlytaisan.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class QRCodeService {
    
    private static final int QR_CODE_SIZE = 300; // Kích thước QR code (pixels)
    
    @Value("${app.qr.base-url:}")
    private String qrBaseUrl;
    
    /**
     * Tạo QR code dưới dạng base64 string
     * @param data Dữ liệu để encode (thường là mã tài sản)
     * @return Base64 string của QR code image
     */
    public String generateQRCodeBase64(String data) {
        try {
            // Cấu hình QR code
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);
            
            // Tạo QR code matrix
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                data, 
                BarcodeFormat.QR_CODE, 
                QR_CODE_SIZE, 
                QR_CODE_SIZE, 
                hints
            );
            
            // Chuyển matrix thành BufferedImage
            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            
            // Chuyển image thành byte array
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            byte[] imageBytes = baos.toByteArray();
            
            // Encode thành base64
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            
            return "data:image/png;base64," + base64Image;
            
        } catch (WriterException | IOException e) {
            log.error("Lỗi khi tạo QR code cho dữ liệu: {}", data, e);
            throw new RuntimeException("Không thể tạo QR code: " + e.getMessage());
        }
    }
    
    /**
     * Tạo QR code cho tài sản.
     * Nội dung QR là đường dẫn tới trang chi tiết tài sản (QR_BASE_URL + id),
     * nhờ vậy quét bằng điện thoại sẽ mở đúng trang.
     *
     * @param taisanId Id tài sản
     * @param mataisan Mã tài sản (dùng khi chưa cấu hình QR_BASE_URL)
     * @return Base64 string của QR code image
     */
    public String generateQRCodeForTaiSan(Long taisanId, String mataisan) {
        String baseUrl = qrBaseUrl != null ? qrBaseUrl.trim() : "";
        if (baseUrl.isEmpty()) {
            return generateQRCodeBase64(mataisan);
        }
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        return generateQRCodeBase64(baseUrl + taisanId);
    }
}
