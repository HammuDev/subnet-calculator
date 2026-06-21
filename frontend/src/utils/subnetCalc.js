/**
 * Subnetting & Networking Calculation Utilities
 */

/**
 * Validates whether the given string is a valid IPv4 address.
 * @param {string} ip 
 * @returns {boolean}
 */
export function validateIp(ip) {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  
  for (let i = 0; i < 4; i++) {
    const num = Number(parts[i]);
    if (parts[i] === '' || isNaN(num) || num < 0 || num > 255 || parts[i].toString() !== num.toString()) {
      return false;
    }
  }
  return true;
}

/**
 * Determines the class of an IPv4 address.
 * @param {string} ip 
 * @returns {'A' | 'B' | 'C' | 'D' | 'E' | 'Unknown'}
 */
export function getIpClass(ip) {
  if (!validateIp(ip)) return 'Unknown';
  const firstOctet = parseInt(ip.split('.')[0], 10);
  
  if (firstOctet >= 1 && firstOctet <= 127) {
    return 'A';
  } else if (firstOctet >= 128 && firstOctet <= 191) {
    return 'B';
  } else if (firstOctet >= 192 && firstOctet <= 223) {
    return 'C';
  } else if (firstOctet >= 224 && firstOctet <= 239) {
    return 'D'; // Multicast
  } else if (firstOctet >= 240 && firstOctet <= 255) {
    return 'E'; // Reserved
  }
  return 'Unknown';
}

/**
 * Gets the default classful CIDR prefix for a given IP class.
 * @param {string} ipClass 
 * @returns {number | null}
 */
export function getDefaultCidr(ipClass) {
  switch (ipClass) {
    case 'A': return 8;
    case 'B': return 16;
    case 'C': return 24;
    default: return null;
  }
}

/**
 * Converts a dotted-decimal IP address into a 32-bit unsigned integer.
 * @param {string} ip 
 * @returns {number}
 */
export function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3];
}

/**
 * Converts a 32-bit unsigned integer into a dotted-decimal IP address string.
 * @param {number} intVal 
 * @returns {string}
 */
export function intToIp(intVal) {
  const o1 = Math.floor(intVal / 16777216) % 256;
  const o2 = Math.floor(intVal / 65536) % 256;
  const o3 = Math.floor(intVal / 256) % 256;
  const o4 = intVal % 256;
  return `${o1}.${o2}.${o3}.${o4}`;
}

/**
 * Converts a CIDR prefix length to a dotted-decimal subnet mask string.
 * @param {number} cidr 
 * @returns {string}
 */
export function getMaskFromCidr(cidr) {
  if (cidr < 0 || cidr > 32) return '255.255.255.255';
  const maskBin = ''.padStart(cidr, '1').padEnd(32, '0');
  const octets = [0, 1, 2, 3].map(i => parseInt(maskBin.slice(i * 8, i * 8 + 8), 2));
  return octets.join('.');
}

/**
 * Calculates the details of a subnet at a specific index.
 * @param {number} alignedBaseIpInt The aligned base network IP as integer
 * @param {number} newCidr The new CIDR prefix
 * @param {number} index The index of the subnet (0-based)
 * @returns {object|null}
 */
export function getSubnetDetails(alignedBaseIpInt, newCidr, index) {
  const subnetSize = Math.pow(2, 32 - newCidr);
  const netInt = alignedBaseIpInt + index * subnetSize;
  
  // Guard against exceeding IPv4 range
  if (netInt + subnetSize > 4294967296) {
    return null;
  }
  
  const broadcastInt = netInt + subnetSize - 1;
  
  let firstUsable = '';
  let lastUsable = '';
  let broadcast = '';
  
  if (newCidr <= 30) {
    firstUsable = intToIp(netInt + 1);
    lastUsable = intToIp(broadcastInt - 1);
    broadcast = intToIp(broadcastInt);
  } else if (newCidr === 31) {
    firstUsable = intToIp(netInt);
    lastUsable = intToIp(broadcastInt);
    broadcast = 'N/A (RFC 3021)';
  } else {
    // /32
    firstUsable = intToIp(netInt);
    lastUsable = intToIp(netInt);
    broadcast = 'N/A (Host Route)';
  }
  
  return {
    index: index + 1,
    network: intToIp(netInt),
    firstUsable,
    lastUsable,
    broadcast,
    range: newCidr <= 32 ? `${firstUsable} - ${lastUsable}` : 'N/A'
  };
}

/**
 * Performs complete subnetting calculations based on input parameters.
 * @param {string} ip 
 * @param {number} subnetsCount 
 * @param {number|null} baseCidrOverride 
 * @returns {object}
 */
export function calculateSubnetting(ip, subnetsCount, baseCidrOverride = null) {
  if (!validateIp(ip)) {
    return { error: 'Invalid IP address format. Please enter a valid IPv4 address (e.g. 10.0.0.0).' };
  }
  
  const ipClass = getIpClass(ip);
  if (ipClass === 'D' || ipClass === 'E') {
    return { error: `IP addresses in Class ${ipClass} are reserved and cannot be subnetted.` };
  }
  
  const defaultCidr = getDefaultCidr(ipClass);
  const startCidr = baseCidrOverride !== null ? baseCidrOverride : defaultCidr;
  
  if (startCidr < 1 || startCidr > 32) {
    return { error: 'Invalid base CIDR prefix. Must be between 1 and 32.' };
  }
  
  if (subnetsCount < 1) {
    return { error: 'Required subnet count must be at least 1.' };
  }
  
  // Calculate how many bits are needed for the subnets
  const borrowedBits = subnetsCount === 1 ? 0 : Math.ceil(Math.log2(subnetsCount));
  const newCidr = startCidr + borrowedBits;
  
  if (newCidr > 32) {
    const maxSubnetsPossible = Math.pow(2, 32 - startCidr);
    return { 
      error: `Cannot create ${subnetsCount} subnets from a /${startCidr} network. The maximum possible subnets is ${maxSubnetsPossible} (which results in a /32 prefix).` 
    };
  }
  
  // Calculate details
  const hostBits = 32 - newCidr;
  const totalSubnetsPossible = Math.pow(2, borrowedBits);
  const totalHostsPerSubnet = Math.pow(2, hostBits);
  const usableHostsPerSubnet = hostBits >= 2 ? totalHostsPerSubnet - 2 : (hostBits === 1 ? 2 : 1);
  
  const subnetMaskStr = getMaskFromCidr(newCidr);
  
  // Base IP and Aligned Network
  const ipIntVal = ipToInt(ip);
  const baseSubnetSize = Math.pow(2, 32 - startCidr);
  const alignedBaseIpInt = Math.floor(ipIntVal / baseSubnetSize) * baseSubnetSize;
  const alignedBaseIp = intToIp(alignedBaseIpInt);
  
  return {
    ipAddress: ip,
    alignedBaseIp,
    ipClass,
    startCidr,
    newCidr,
    borrowedBits,
    hostBits,
    subnetMask: subnetMaskStr,
    totalSubnetsPossible,
    totalHostsPerSubnet,
    usableHostsPerSubnet,
    alignedBaseIpInt
  };
}
