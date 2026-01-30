import pkg_resources
import sys

required_packages = [
    "fastapi==0.104.1",
    "uvicorn[standard]==0.24.0",
    "sqlalchemy==2.0.23",
    "pydantic==2.5.0",
    "pypdf==3.17.0",
    "python-jose[cryptography]==3.3.0",
    "passlib[bcrypt]==1.7.4",
    "aiofiles==23.2.1",
    "httpx==0.25.1",
    "python-dotenv==1.0.0"
]

print("Checking required packages...")
missing_packages = []

for package in required_packages:
    try:
        # Extract package name without version
        pkg_name = package.split('==')[0].split('[')[0]
        pkg_resources.require(package)
        print(f"✅ {pkg_name}")
    except pkg_resources.DistributionNotFound:
        missing_packages.append(package)
        print(f"❌ {package}")
    except pkg_resources.VersionConflict as e:
        print(f"⚠️ Version conflict: {e}")
    except Exception as e:
        print(f"❓ Error checking {package}: {e}")

if missing_packages:
    print(f"\n❌ Missing packages: {', '.join(missing_packages)}")
    print("Install with: pip install " + " ".join(missing_packages))
    sys.exit(1)
else:
    print("\n✅ All packages are installed!")
