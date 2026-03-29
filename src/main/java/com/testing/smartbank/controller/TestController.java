package com.testing.smartbank.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/test")
public class TestController {

    // ── WAIT ELEMENT: returns 200 after a configurable delay ────────────────
    @GetMapping("/wait-element")
    public ResponseEntity<Map<String, Object>> waitElement(
            @RequestParam(defaultValue = "3000") long delayMs) throws InterruptedException {
        Thread.sleep(Math.min(delayMs, 10000));
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("visible", true);
        body.put("message", "Element is now visible after " + delayMs + "ms delay");
        body.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        return ResponseEntity.ok(body);
    }

    // ── OTP: returns a fixed test OTP ────────────────────────────────────────
    @GetMapping("/otp")
    public ResponseEntity<Map<String, Object>> getOtp() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("otp", "123456");
        body.put("expiresIn", 300);
        body.put("message", "OTP sent to registered mobile");
        return ResponseEntity.ok(body);
    }

    // ── UPLOAD: accepts file, returns metadata ────────────────────────────────
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("fileName", file.getOriginalFilename());
        body.put("size", file.getSize());
        body.put("contentType", file.getContentType());
        body.put("message", "File '" + file.getOriginalFilename() + "' uploaded successfully");
        return ResponseEntity.ok(body);
    }

    // ── TABLE DATA: paginated rows for transaction table ─────────────────────
    @GetMapping("/table-data")
    public ResponseEntity<Map<String, Object>> tableData(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "") String category,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        List<Map<String, Object>> allRows = generateFakeTransactions();

        // Filter
        if (!category.isEmpty()) {
            allRows = allRows.stream()
                    .filter(r -> category.equalsIgnoreCase(r.get("category").toString()))
                    .collect(java.util.stream.Collectors.toList());
        }

        // Sort
        Comparator<Map<String, Object>> comp;
        if ("amount".equals(sortBy)) {
            comp = Comparator.comparingDouble(r -> ((Number) r.get("amount")).doubleValue());
        } else {
            comp = Comparator.comparing(r -> r.get("date").toString());
        }
        if ("desc".equals(sortDir)) comp = comp.reversed();
        allRows.sort(comp);

        // Paginate
        int total = allRows.size();
        int fromIdx = Math.min((page - 1) * size, total);
        int toIdx = Math.min(fromIdx + size, total);
        List<Map<String, Object>> pageRows = allRows.subList(fromIdx, toIdx);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", pageRows);
        response.put("total", total);
        response.put("page", page);
        response.put("size", size);
        response.put("totalPages", (int) Math.ceil((double) total / size));
        return ResponseEntity.ok(response);
    }

    // ── IFRAME INNER PAGE (nested) ────────────────────────────────────────────
    @GetMapping(value = "/frame-inner", produces = MediaType.TEXT_HTML_VALUE)
    public String frameInner() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body{margin:0;font-family:Arial,sans-serif;background:#1a1a2e;color:#e2e8f0;display:flex;
                     align-items:center;justify-content:center;height:100vh;flex-direction:column;gap:1rem;}
                input{padding:0.5rem 0.75rem;border-radius:6px;border:1px solid #4a5568;background:#2d3748;
                      color:#e2e8f0;}
                button{padding:0.4rem 1rem;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;}
                #innerResult{color:#4ade80;font-weight:bold;}
              </style>
            </head>
            <body>
              <p style="font-size:0.85rem;opacity:0.6;">📦 Inner Nested iFrame</p>
              <input type="text" id="innerFrameInput" placeholder="Type inside inner iframe">
              <button id="btn-inner-submit" onclick="document.getElementById('innerResult').innerText='Submitted: '+document.getElementById('innerFrameInput').value">Submit</button>
              <div id="innerResult"></div>
            </body>
            </html>
            """;
    }

    // ── IFRAME OUTER WRAPPER PAGE ──────────────────────────────────────────────
    @GetMapping(value = "/frame-outer", produces = MediaType.TEXT_HTML_VALUE)
    public String frameOuter() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body{margin:0;font-family:Arial,sans-serif;background:#16213e;color:#e2e8f0;padding:1.5rem;}
                input{padding:0.5rem 0.75rem;border-radius:6px;border:1px solid #4a5568;background:#2d3748;
                      color:#e2e8f0;display:block;margin-bottom:0.75rem;}
                button{padding:0.4rem 1rem;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;margin-bottom:1rem;}
                iframe{width:100%;border:1px dashed #6366f1;border-radius:8px;height:200px;}
                label{display:block;margin-bottom:0.3rem;font-size:0.8rem;opacity:0.8;}
              </style>
            </head>
            <body>
              <p style="font-size:0.85rem;opacity:0.6;">🖼️ Outer iFrame</p>
              <label>Outer Frame Input</label>
              <input type="text" id="outerFrameInput" name="outerInput" placeholder="Type in outer frame">
              <button id="btn-outer-action" onclick="document.getElementById('outerMsg').innerText='Outer: '+document.getElementById('outerFrameInput').value">Confirm Outer</button>
              <div id="outerMsg" style="color:#facc15;margin-bottom:1rem;"></div>
              <label>Nested Inner iFrame ↓</label>
              <iframe id="innerFrame" src="/test/frame-inner" title="Inner Frame"></iframe>
            </body>
            </html>
            """;
    }

    // ── BROKEN LINKS PAGE ─────────────────────────────────────────────────────
    @GetMapping(value = "/broken-links", produces = MediaType.TEXT_HTML_VALUE)
    public String brokenLinks() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body{margin:0;font-family:Arial,sans-serif;background:#1a1a2e;color:#e2e8f0;padding:2rem;}
                a{color:#60a5fa;} img{display:block;margin:0.5rem 0;}
              </style>
            </head>
            <body>
              <h3>Broken Links Test Page</h3>
              <p>Valid link: <a id="link-valid" href="/">BugBank Home</a></p>
              <p>Broken link 1: <a id="link-broken-1" href="/this-page-does-not-exist-404">Broken Page</a></p>
              <p>Broken link 2: <a id="link-broken-2" href="/another-broken-path">Another Broken</a></p>
              <p>Valid image: <img id="img-valid" src="/favicon.ico" alt="valid" width="32"></p>
              <p>Broken image 1: <img id="img-broken-1" src="/nonexistent-image.png" alt="broken img" width="100"></p>
              <p>Broken image 2: <img id="img-broken-2" src="/assets/missing.jpg" alt="missing asset" width="100"></p>
            </body>
            </html>
            """;
    }

    // ── VERIFY OTP (for fund-transfer step) ───────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestParam String otp) {
        Map<String, Object> body = new LinkedHashMap<>();
        boolean valid = "123456".equals(otp.trim());
        body.put("valid", valid);
        body.put("message", valid ? "OTP verified successfully" : "Invalid OTP. Please try again.");
        return ResponseEntity.ok(body);
    }

    // ── VERIFY RECIPIENT (for fund-transfer step) ─────────────────────────────
    @GetMapping("/verify-recipient")
    public ResponseEntity<Map<String, Object>> verifyRecipient(
            @RequestParam String accountNumber) throws InterruptedException {
        Thread.sleep(1500); // simulate delay for explicit-wait testing
        Map<String, Object> body = new LinkedHashMap<>();
        // Accept any account number that starts with a digit and is 6+ chars
        boolean found = accountNumber.matches("\\d{6,}");
        body.put("found", found);
        body.put("accountNumber", accountNumber);
        body.put("recipientName", found ? "Test Recipient User" : null);
        body.put("bankName", found ? "BugBank" : null);
        body.put("message", found ? "Recipient verified" : "Account not found");
        return ResponseEntity.ok(body);
    }

    // ── LOAN ELIGIBILITY CHECK ────────────────────────────────────────────────
    @PostMapping("/loan-check")
    public ResponseEntity<Map<String, Object>> loanCheck(
            @RequestParam double income,
            @RequestParam double amount,
            @RequestParam int months) {
        Map<String, Object> body = new LinkedHashMap<>();
        double emi = (amount * 0.09 / 12) / (1 - Math.pow(1 + 0.09 / 12, -months));
        double ratio = emi / income;
        boolean approved = ratio < 0.5 && amount <= income * 60;
        body.put("approved", approved);
        body.put("emi", Math.round(emi * 100.0) / 100.0);
        body.put("totalPayable", Math.round(emi * months * 100.0) / 100.0);
        body.put("interestRate", 9.0);
        body.put("status", approved ? "APPROVED" : "REJECTED");
        body.put("message", approved
                ? "Congratulations! Your loan application has been pre-approved."
                : "We're unable to approve your loan at this time. EMI-to-income ratio too high.");
        return ResponseEntity.ok(body);
    }

    // ─── Helper: generate fake transaction rows ───────────────────────────────
    private List<Map<String, Object>> generateFakeTransactions() {
        String[] types = {"TRANSFER_IN", "TRANSFER_OUT", "DEPOSIT", "WITHDRAWAL", "LOAN_DISBURSEMENT", "LOAN_PAYMENT"};
        String[] categories = {"Personal", "Grocery", "Travel", "Investment", "Loan", "Friend/Family", "Salary", "EMI"};
        String[] statuses = {"SUCCESS", "SUCCESS", "SUCCESS", "PENDING", "FAILED"};
        Random rnd = new Random(42);
        List<Map<String, Object>> list = new ArrayList<>();
        LocalDateTime base = LocalDateTime.now().minusDays(60);
        for (int i = 1; i <= 80; i++) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", "TXN" + String.format("%04d", i));
            row.put("type", types[rnd.nextInt(types.length)]);
            row.put("category", categories[rnd.nextInt(categories.length)]);
            double amt = Math.round((500 + rnd.nextDouble() * 49500) * 100.0) / 100.0;
            row.put("amount", amt);
            row.put("date", base.plusHours(i * 18L).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")));
            row.put("status", statuses[rnd.nextInt(statuses.length)]);
            row.put("ref", "REF" + (1000000 + rnd.nextInt(9000000)));
            list.add(row);
        }
        return list;
    }
}