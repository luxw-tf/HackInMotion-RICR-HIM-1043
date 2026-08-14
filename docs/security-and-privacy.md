# Security & Privacy Model Specification

## 1. Principles of Financial Data Protection

Clarity is engineered with strict tenant isolation, zero third-party telemetry, and cryptographic verification of all state changes.

---

## 2. Multi-Tenant Query Scoping

Every database query is strictly filtered by the authenticated user's verified session identity:

```typescript
// Enforced query pattern across all API routes
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Scoped to session.user.id
const records = await prisma.transaction.findMany({
  where: { userId: session.user.id },
});
```

Zero cross-tenant leaks are mathematically possible since foreign keys enforce cascade constraints.

---

## 3. Cryptographic Storage & Sessions

1. **Password Protection**: Passwords are never stored in plaintext. They are salted and hashed using `bcrypt` (10 rounds) before persistence.
2. **Session Security**: NextAuth generates encrypted JSON Web Tokens (JWT) signed with `NEXTAUTH_SECRET` utilizing authenticated AES-GCM encryption.
3. **Database Communication**: PostgreSQL connections use TLS encrypted streams (`sslmode=require` / transaction pooler).
4. **Statement Decryption**: Password-protected PDF statements are decrypted ephemerally in-memory without ever persisting the PDF file or decryption password to disk.
