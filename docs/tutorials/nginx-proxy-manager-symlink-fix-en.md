---
sidebar_position: 4
---

# Fixing Nginx Proxy Manager Symlinks After Manual Backup

When you backup Nginx Proxy Manager by manually copying directories, Let's Encrypt symlinks can be broken, leading to SSL certificate renewal errors. This guide will help you fix this issue.

## 1. Understanding the Problem

### 1.1. Root Cause

Manual backup through copy/paste operations can break Let's Encrypt symbolic links (symlinks). These symlinks are crucial because:

- They link files in `/etc/letsencrypt/live/` with actual files in `/etc/letsencrypt/archive/`
- Certbot needs these symlinks to manage and renew certificates
- Without symlinks, Certbot cannot find certificates for renewal

### 1.2. Common Error Messages

```
{
    "error": {
        "message": "Internal Error"
    },
    "debug": {
        "stack": [
            "Renewal configuration file /etc/letsencrypt/renewal/npm-2.conf is broken.",
            "The error was: expected /etc/letsencrypt/live/npm-2/cert.pem to be a symlink",
            "Skipping."
        ]
    }
}
```

## 2. Checking Current Status

### 2.1. Identify Volume Path

First, determine the Nginx Proxy Manager volume path on the host:

```bash
docker inspect <container_name> | grep -A 5 -B 5 "letsencrypt"
```

Or check in your `docker-compose.yml` file:

```yaml
volumes:
  - /home/ubuntu/nginxproxymanager/letsencrypt:/etc/letsencrypt
```

### 2.2. Check Directory Structure

Check the live directory:

```bash
ls -la /home/ubuntu/nginxproxymanager/letsencrypt/live/npm-2/
```

Check the archive directory:

```bash
ls -la /home/ubuntu/nginxproxymanager/letsencrypt/archive/npm-2/
```

### 2.3. Identify Broken Certificates

List all certificates:

```bash
ls /home/ubuntu/nginxproxymanager/letsencrypt/live/
```

## 3. Fixing Symlinks

### 3.1. Method 1: Recreate Relative Symlinks (Recommended)

#### 3.1.1. Step 1: Navigate to Live Directory

```bash
cd /home/ubuntu/nginxproxymanager/letsencrypt/live/npm-2
```

#### 3.1.2. Step 2: Remove Old Files/Symlinks

```bash
sudo rm -f cert.pem privkey.pem chain.pem fullchain.pem
```

#### 3.1.3. Step 3: Determine Certificate Version Number

Check the archive directory to identify the latest version number:

```bash
ls -la ../../archive/npm-2/
```

You will see files like:
- `cert1.pem`, `cert2.pem`, ...
- `privkey1.pem`, `privkey2.pem`, ...
- `chain1.pem`, `chain2.pem`, ...
- `fullchain1.pem`, `fullchain2.pem`, ...

#### 3.1.4. Step 4: Create Relative Symlinks

Use the highest version number (example: `1`):

```bash
sudo ln -sf ../../archive/npm-2/cert1.pem cert.pem
sudo ln -sf ../../archive/npm-2/privkey1.pem privkey.pem  
sudo ln -sf ../../archive/npm-2/chain1.pem chain.pem
sudo ln -sf ../../archive/npm-2/fullchain1.pem fullchain.pem
```

#### 3.1.5. Step 5: Verify Symlinks

```bash
ls -la
```

Expected result:
```
cert.pem -> ../../archive/npm-2/cert1.pem
privkey.pem -> ../../archive/npm-2/privkey1.pem
chain.pem -> ../../archive/npm-2/chain1.pem
fullchain.pem -> ../../archive/npm-2/fullchain1.pem
```

### 3.2. Method 2: Automated Script

Create a script to automatically fix multiple certificates:

```bash
#!/bin/bash

# Path to letsencrypt directory
LETSENCRYPT_PATH="/home/ubuntu/nginxproxymanager/letsencrypt"

# Find all certificates
for cert_dir in "$LETSENCRYPT_PATH/live"/*; do
    if [ -d "$cert_dir" ]; then
        cert_name=$(basename "$cert_dir")
        echo "Processing certificate: $cert_name"
        
        # Navigate to live directory
        cd "$cert_dir"
        
        # Remove old symlinks/files
        sudo rm -f cert.pem privkey.pem chain.pem fullchain.pem
        
        # Find latest version
        latest_num=$(ls ../../archive/"$cert_name"/cert*.pem | grep -o '[0-9]\+' | sort -n | tail -1)
        
        # Create new symlinks
        sudo ln -sf "../../archive/$cert_name/cert${latest_num}.pem" cert.pem
        sudo ln -sf "../../archive/$cert_name/privkey${latest_num}.pem" privkey.pem
        sudo ln -sf "../../archive/$cert_name/chain${latest_num}.pem" chain.pem
        sudo ln -sf "../../archive/$cert_name/fullchain${latest_num}.pem" fullchain.pem
        
        echo "Completed $cert_name"
    fi
done
```

## 4. Restart Container

After fixing symlinks, restart the container:

```bash
# With Docker Compose
docker-compose restart nginx-proxy-manager

# With regular Docker
docker restart <container_name>
```

## 5. Verify Results

### 5.1. Check Logs

```bash
docker logs <container_name>
```

### 5.2. Test Certificate Renewal

Enter the container and test:

```bash
docker exec -it <container_name> bash
certbot renew --dry-run -v
```

### 5.3. Check NPM Interface

- Log into Nginx Proxy Manager
- Check SSL Certificates
- Try force renewing a certificate

## 6. Preventing Future Issues

### 6.1. Use Docker Volume Backup

Instead of manual copying, use:

```bash
# Backup volume
docker run --rm -v nginx-proxy-manager_letsencrypt:/source -v $(pwd):/backup alpine tar czf /backup/letsencrypt-backup.tar.gz -C /source .

# Restore volume
docker run --rm -v nginx-proxy-manager_letsencrypt:/target -v $(pwd):/backup alpine tar xzf /backup/letsencrypt-backup.tar.gz -C /target
```

### 6.2. Use Rsync with Symlink Preservation

```bash
rsync -avh --links /source/nginxproxymanager/ /backup/nginxproxymanager/
```

### 6.3. Create Automated Backup Script

```bash
#!/bin/bash

BACKUP_DIR="/backup/npm-$(date +%Y%m%d-%H%M%S)"
SOURCE_DIR="/home/ubuntu/nginxproxymanager"

mkdir -p "$BACKUP_DIR"

# Backup with preserved symlinks
rsync -avh --links "$SOURCE_DIR/" "$BACKUP_DIR/"

echo "Backup completed: $BACKUP_DIR"
```

## 7. Troubleshooting

### 7.1. Error: "target does not exist"

If you see this error, it means you created absolute symlinks instead of relative ones:

```bash
# WRONG - absolute symlink
sudo ln -sf /home/ubuntu/nginxproxymanager/letsencrypt/archive/npm-2/cert1.pem cert.pem

# CORRECT - relative symlink  
sudo ln -sf ../../archive/npm-2/cert1.pem cert.pem
```

### 7.2. Archive Files Not Found

If there are no files in the archive, the certificate may be completely lost:

1. Delete the old certificate:
   ```bash
   docker exec -it <container_name> certbot delete --cert-name npm-2
   ```

2. Create a new certificate through NPM interface

### 7.3. Multiple Certificates

For multiple certificates (npm-2, npm-4, ...):

```bash
for cert in npm-2 npm-4; do
    echo "Processing $cert..."
    cd "/home/ubuntu/nginxproxymanager/letsencrypt/live/$cert"
    sudo rm -f *.pem
    latest=$(ls ../../archive/$cert/cert*.pem | grep -o '[0-9]\+' | sort -n | tail -1)
    sudo ln -sf "../../archive/$cert/cert${latest}.pem" cert.pem
    sudo ln -sf "../../archive/$cert/privkey${latest}.pem" privkey.pem
    sudo ln -sf "../../archive/$cert/chain${latest}.pem" chain.pem
    sudo ln -sf "../../archive/$cert/fullchain${latest}.pem" fullchain.pem
done
```

## 8. Conclusion

Fixing symlinks after manual backup is essential to ensure Nginx Proxy Manager functions properly. Remember:

1. Always use relative symlinks, not absolute ones
2. Identify the correct latest certificate version number
3. Restart the container after fixing
4. Use proper backup methods to avoid this issue

In the future, consider using specialized backup tools or Docker volume backup to ensure data integrity. 