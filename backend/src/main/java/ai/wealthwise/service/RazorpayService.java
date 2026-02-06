package ai.wealthwise.service;

import ai.wealthwise.model.dto.payment.PaymentInitRequest;
import ai.wealthwise.model.dto.payment.PaymentInitResponse;
import ai.wealthwise.model.dto.payment.PaymentVerifyRequest;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public RazorpayService(RazorpayClient razorpayClient) {
        this.razorpayClient = razorpayClient;
    }

    public PaymentInitResponse createOrder(PaymentInitRequest request) throws RazorpayException {
        JSONObject orderRequest = new JSONObject();
        // Convert amount to paise (multiply by 100)
        BigDecimal amountInPaise = request.getAmount().multiply(new BigDecimal("100"));
        orderRequest.put("amount", amountInPaise.intValue());
        orderRequest.put("currency", request.getCurrency());
        orderRequest.put("receipt",
                request.getReceiptId() != null ? request.getReceiptId() : "txn_" + UUID.randomUUID().toString());

        // Notes can be added here
        // orderRequest.put("notes", new JSONObject().put("description",
        // request.getDescription()));

        Order order = razorpayClient.orders.create(orderRequest);

        return PaymentInitResponse.builder()
                .orderId(order.get("id"))
                .currency(order.get("currency"))
                .amount(order.get("amount"))
                .keyId(keyId)
                .receiptId(order.get("receipt"))
                .build();
    }

    public boolean verifyPayment(PaymentVerifyRequest request) throws RazorpayException {
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        return Utils.verifyPaymentSignature(options, keySecret);
    }
}
