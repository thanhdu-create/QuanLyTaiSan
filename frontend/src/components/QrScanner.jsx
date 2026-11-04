import { useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { message } from 'antd'

const QrScanner = ({ onScan, onError, onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null)
  const html5QrcodeRef = useRef(null)

  // Support both prop names for backward compatibility
  const handleScanSuccess = onScan || onScanSuccess
  const handleScanError = onError || onScanError

  useEffect(() => {
    const startScanner = async () => {
      try {
        html5QrcodeRef.current = new Html5Qrcode('qr-reader')
        
        // Request camera permission first
        const cameras = await Html5Qrcode.getCameras()
        if (!cameras || cameras.length === 0) {
          throw new Error('Không tìm thấy camera trên thiết bị')
        }

        // Try to use back camera first, fallback to any camera
        const cameraConfig = { facingMode: { ideal: 'environment' } }
        
        await html5QrcodeRef.current.start(
          cameraConfig,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Lấy taisan_id từ URL: https://domain.com/assets/{taisan_id}
            const match = decodedText.match(/\/assets\/(\d+)/)
            if (match && match[1]) {
              if (handleScanSuccess) handleScanSuccess(match[1])
            } else {
              message.warning('Mã QR không hợp lệ')
              if (handleScanError) handleScanError('Invalid QR format')
            }
          },
          (errorMessage) => {
            // Không xử lý lỗi liên tục khi quét (scanning errors)
          }
        )
      } catch (error) {
        console.error('Camera error:', error)
        let errorMsg = 'Không thể mở camera'
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMsg = 'Vui lòng cấp quyền truy cập camera'
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMsg = 'Không tìm thấy camera trên thiết bị'
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMsg = 'Camera đang được sử dụng bởi ứng dụng khác'
        } else if (error.name === 'NotSupportedError') {
          errorMsg = 'Trình duyệt không hỗ trợ camera hoặc cần HTTPS'
        }
        
        message.error(errorMsg)
        if (handleScanError) handleScanError(error)
      }
    }

    startScanner()

    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current
          .stop()
          .catch((err) => console.error('Error stopping scanner:', err))
      }
    }
  }, [handleScanSuccess, handleScanError])

  return (
    <div>
      <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
    </div>
  )
}

export default QrScanner
