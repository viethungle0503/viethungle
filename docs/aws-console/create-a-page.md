---
sidebar_position: 1
---

# General

**AWS Console Command** for convenience interact with AWS

## Mostly using console commands

- Create a new profile with name `my-profile-us-west-1`:

```bash title="Bash"
aws configure --profile my-profile-us-west-1
```

- Get information of the profile with name `my-profile-us-west-1`:

```bash title="Bash"
aws ec2 describe-instances --profile my-profile-us-west-1
```

- Start instance with id `i-xxxxxxxxxxxxxxxxx` in profile `my-profile-us-west-1`:

```bash title="Bash"
aws ec2 start-instances --profile my-profile-ap-southeast-1 --instance-ids i-xxxxxxxxxxxxxxxxx
```

- Stop instance with id `i-xxxxxxxxxxxxxxxxx` in profile `my-profile-us-west-1`:

```bash title="Bash"
aws ec2 stop-instances --instance-ids i-xxxxxxxxxxxxxxxxx
```
