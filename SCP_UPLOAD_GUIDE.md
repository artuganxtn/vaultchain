# SCP Upload Guide - Transfer Files to EC2

SCP (Secure Copy Protocol) allows you to securely transfer files from your local machine to your EC2 instance.

---

## Prerequisites

- Your EC2 instance is running
- You have your `.pem` key file (e.g., `vaultchain-key.pem`)
- You know your EC2 instance public IP or domain
- SSH access to EC2 is working

---

## Basic SCP Syntax

```bash
scp -i /path/to/key.pem [options] source destination
```

---

## Windows (PowerShell or Command Prompt)

### Step 1: Set Permissions on Key File (First time only)

```powershell
# In PowerShell (as Administrator)
icacls "C:\path\to\your-key.pem" /inheritance:r
icacls "C:\path\to\your-key.pem" /grant:r "$env:USERNAME:(R)"
```

### Step 2: Upload Entire Project

```powershell
# From your project directory (where vaultchain folder is)
scp -i "C:\path\to\your-key.pem" -r .\* ubuntu@your-ec2-ip:~/vaultchain-app/
```

**Example:**
```powershell
scp -i "C:\Users\dipnr\Downloads\vaultchain-key.pem" -r .\* ubuntu@54.123.45.67:~/vaultchain-app/
```

### Step 3: Upload Specific Folders

```powershell
# Upload backend only
scp -i "C:\path\to\your-key.pem" -r .\backend ubuntu@your-ec2-ip:~/vaultchain-app/

# Upload frontend only
scp -i "C:\path\to\your-key.pem" -r .\frontend ubuntu@your-ec2-ip:~/vaultchain-app/
```

---

## Mac/Linux (Terminal)

### Step 1: Set Permissions on Key File (First time only)

```bash
chmod 400 /path/to/your-key.pem
```

### Step 2: Upload Entire Project

```bash
# From your project directory
scp -i /path/to/your-key.pem -r ./* ubuntu@your-ec2-ip:~/vaultchain-app/
```

**Example:**
```bash
scp -i ~/Downloads/vaultchain-key.pem -r ./* ubuntu@54.123.45.67:~/vaultchain-app/
```

### Step 3: Upload Specific Folders

```bash
# Upload backend only
scp -i /path/to/your-key.pem -r ./backend ubuntu@your-ec2-ip:~/vaultchain-app/

# Upload frontend only
scp -i /path/to/your-key.pem -r ./frontend ubuntu@your-ec2-ip:~/vaultchain-app/
```

---

## Complete Upload Process

### Option 1: Upload Everything (Recommended for First Time)

**Windows:**
```powershell
cd C:\Users\dipnr\Downloads\vaultchain
scp -i "C:\path\to\your-key.pem" -r .\* ubuntu@your-ec2-ip:~/vaultchain-app/
```

**Mac/Linux:**
```bash
cd ~/Downloads/vaultchain
scp -i ~/path/to/your-key.pem -r ./* ubuntu@your-ec2-ip:~/vaultchain-app/
```

### Option 2: Upload Specific Directories

**Backend:**
```bash
# Windows
scp -i "C:\path\to\your-key.pem" -r .\backend ubuntu@your-ec2-ip:~/vaultchain-app/

# Mac/Linux
scp -i ~/path/to/your-key.pem -r ./backend ubuntu@your-ec2-ip:~/vaultchain-app/
```

**Frontend:**
```bash
# Windows
scp -i "C:\path\to\your-key.pem" -r .\* ubuntu@your-ec2-ip:~/vaultchain-app/frontend/ --exclude node_modules --exclude dist

# Mac/Linux
scp -i ~/path/to/your-key.pem -r ./components ./pages ./services ./translations ./vite.config.ts ./package.json ./tsconfig.json ./index.html ubuntu@your-ec2-ip:~/vaultchain-app/frontend/
```

---

## SCP Options Explained

| Option | Description |
|--------|-------------|
| `-i` | Identity file (your .pem key) |
| `-r` | Recursive (copy directories) |
| `-v` | Verbose (show progress) |
| `-P` | Port (if SSH uses non-default port) |

---

## Common SCP Commands

### Upload Single File
```bash
scp -i /path/to/key.pem file.txt ubuntu@ec2-ip:~/vaultchain-app/
```

### Upload Multiple Files
```bash
scp -i /path/to/key.pem file1.txt file2.txt ubuntu@ec2-ip:~/vaultchain-app/
```

### Upload with Verbose Output
```bash
scp -i /path/to/key.pem -v -r ./backend ubuntu@ec2-ip:~/vaultchain-app/
```

### Download from EC2 to Local
```bash
scp -i /path/to/key.pem ubuntu@ec2-ip:~/vaultchain-app/backend/database.db ./
```

---

## Recommended Upload Strategy

### First Time Deployment:

1. **Create directory structure on EC2:**
   ```bash
   ssh -i /path/to/key.pem ubuntu@your-ec2-ip
   mkdir -p ~/vaultchain-app/{backend,frontend}
   exit
   ```

2. **Upload Backend:**
   ```bash
   scp -i /path/to/key.pem -r ./backend/* ubuntu@your-ec2-ip:~/vaultchain-app/backend/
   ```

3. **Upload Frontend:**
   ```bash
   scp -i /path/to/key.pem -r ./components ./pages ./services ./translations ./vite.config.ts ./package.json ./tsconfig.json ./index.html ./src ubuntu@your-ec2-ip:~/vaultchain-app/frontend/
   ```

---

## Excluding Files (Using rsync - Better Option)

Instead of SCP, you can use `rsync` which is better for excluding files:

### Install rsync (if not available)
```bash
# Windows: Install via WSL or Git Bash
# Mac/Linux: Usually pre-installed
```

### Upload with Exclusions
```bash
rsync -avz -e "ssh -i /path/to/key.pem" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.env' \
  ./ ubuntu@your-ec2-ip:~/vaultchain-app/
```

---

## Troubleshooting

### Error: "Permission denied (publickey)"

**Solution:**
- Check key file path is correct
- On Windows: Set permissions using `icacls`
- On Mac/Linux: Run `chmod 400 key.pem`

### Error: "Connection timed out"

**Solution:**
- Check security group allows SSH (port 22)
- Verify EC2 public IP is correct
- Check if EC2 instance is running

### Error: "Host key verification failed"

**Solution:**
```bash
ssh-keygen -R your-ec2-ip
```

### Files Not Transferring

**Solution:**
- Use `-v` flag to see verbose output
- Check file paths are correct
- Ensure destination directory exists

---

## Quick Reference

### Your Specific Case:

```powershell
# Windows PowerShell
cd C:\Users\dipnr\Downloads\vaultchain

# Upload everything
scp -i "C:\path\to\vaultchain-key.pem" -r .\* ubuntu@your-ec2-ip:~/vaultchain-app/

# Or upload separately
scp -i "C:\path\to\vaultchain-key.pem" -r .\backend ubuntu@your-ec2-ip:~/vaultchain-app/
scp -i "C:\path\to\vaultchain-key.pem" -r .\components .\pages .\services ubuntu@your-ec2-ip:~/vaultchain-app/frontend/
```

---

## Alternative: Use Git (Recommended for Updates)

Instead of SCP for updates, use Git:

```bash
# On EC2
cd ~/vaultchain-app/backend
git pull origin main

# Or clone fresh
git clone your-repo-url ~/vaultchain-app
```

---

## Tips

1. **First time**: Upload everything
2. **Updates**: Use Git or rsync for faster transfers
3. **Exclude**: Don't upload `node_modules`, `.git`, `dist` folders
4. **Check**: Verify files after upload using SSH
5. **Backup**: Keep backups before major uploads

---

## Verify Upload

After uploading, verify files:

```bash
ssh -i /path/to/key.pem ubuntu@your-ec2-ip
cd ~/vaultchain-app
ls -la
cd backend && ls -la
cd ../frontend && ls -la
exit
```

Good luck with your upload! 🚀

