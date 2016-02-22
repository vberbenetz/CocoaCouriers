-- MySQL dump 10.13  Distrib 5.5.47, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: cocoacouriers
-- ------------------------------------------------------
-- Server version	5.5.47-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `AdditionalProductOrigin`
--

DROP TABLE IF EXISTS `AdditionalProductOrigin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AdditionalProductOrigin` (
  `cocoaOrigin` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `productId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`cocoaOrigin`,`productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AdditionalProductOrigin`
--

LOCK TABLES `AdditionalProductOrigin` WRITE;
/*!40000 ALTER TABLE `AdditionalProductOrigin` DISABLE KEYS */;
/*!40000 ALTER TABLE `AdditionalProductOrigin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AdminUsers`
--

DROP TABLE IF EXISTS `AdminUsers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AdminUsers` (
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `enabled` bit(1) DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AdminUsers`
--

LOCK TABLES `AdminUsers` WRITE;
/*!40000 ALTER TABLE `AdminUsers` DISABLE KEYS */;
INSERT INTO `AdminUsers` VALUES ('val@cantangosolutions.com','','$2a$10$cyftYvxb5Y.OLYrlON/hPuv5ZE4w5LzrSHzrQWoXdwyC664W3a2hK');
/*!40000 ALTER TABLE `AdminUsers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AltShippingAddress`
--

DROP TABLE IF EXISTS `AltShippingAddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AltShippingAddress` (
  `city` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stripeId` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `postalCode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `state` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street1` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street2` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street3` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AltShippingAddress`
--

LOCK TABLES `AltShippingAddress` WRITE;
/*!40000 ALTER TABLE `AltShippingAddress` DISABLE KEYS */;
/*!40000 ALTER TABLE `AltShippingAddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Authorities`
--

DROP TABLE IF EXISTS `Authorities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Authorities` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `authority` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_hfx34rm9u0mx7lyi8fh1ig4cw` (`username`),
  CONSTRAINT `FK_hfx34rm9u0mx7lyi8fh1ig4cw` FOREIGN KEY (`username`) REFERENCES `AdminUsers` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Authorities`
--

LOCK TABLES `Authorities` WRITE;
/*!40000 ALTER TABLE `Authorities` DISABLE KEYS */;
/*!40000 ALTER TABLE `Authorities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BillingAddress`
--

DROP TABLE IF EXISTS `BillingAddress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `BillingAddress` (
  `stripeId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `company` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `postalCode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `state` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street1` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street2` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street3` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`stripeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BillingAddress`
--

LOCK TABLES `BillingAddress` WRITE;
/*!40000 ALTER TABLE `BillingAddress` DISABLE KEYS */;
/*!40000 ALTER TABLE `BillingAddress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Charge`
--

DROP TABLE IF EXISTS `Charge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Charge` (
  `id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `altShippingAddressId` bigint(20) DEFAULT NULL,
  `amount` int(11) DEFAULT NULL,
  `taxAmount` int(11) DEFAULT NULL,
  `shippingCost` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `currency` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `customerId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `failureCode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `failureMessage` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `invoiceId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `paid` bit(1) DEFAULT NULL,
  `serializedChargeData` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Charge`
--

LOCK TABLES `Charge` WRITE;
/*!40000 ALTER TABLE `Charge` DISABLE KEYS */;
/*!40000 ALTER TABLE `Charge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Customer`
--

DROP TABLE IF EXISTS `Customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Customer` (
  `stripeId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created` datetime DEFAULT NULL,
  `currency` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `defaultSource` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `delinquent` bit(1) DEFAULT NULL,
  `discountId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `localId` bigint(20) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `taxDesc` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `taxRate` int(11) DEFAULT NULL,
  `billingAddress_stripeId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`stripeId`),
  KEY `FK_qyltf945re0blo6bx4a3el2ww` (`billingAddress_stripeId`),
  CONSTRAINT `FK_qyltf945re0blo6bx4a3el2ww` FOREIGN KEY (`billingAddress_stripeId`) REFERENCES `BillingAddress` (`stripeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Customer`
--

LOCK TABLES `Customer` WRITE;
/*!40000 ALTER TABLE `Customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `Customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `EventRecord`
--

DROP TABLE IF EXISTS `EventRecord`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `EventRecord` (
  `stripeEventId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`stripeEventId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `EventRecord`
--

LOCK TABLES `EventRecord` WRITE;
/*!40000 ALTER TABLE `EventRecord` DISABLE KEYS */;
/*!40000 ALTER TABLE `EventRecord` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Invoice`
--

DROP TABLE IF EXISTS `Invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Invoice` (
  `id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `amountDue` int(11) DEFAULT NULL,
  `chargeId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `currency` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `customerId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `paid` bit(1) DEFAULT NULL,
  `subscriptionId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `subtotal` int(11) DEFAULT NULL,
  `tax` int(11) DEFAULT NULL,
  `taxPercent` double DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Invoice`
--

LOCK TABLES `Invoice` WRITE;
/*!40000 ALTER TABLE `Invoice` DISABLE KEYS */;
/*!40000 ALTER TABLE `Invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Issue`
--

DROP TABLE IF EXISTS `Issue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Issue` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `issueCode` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stripeCustomerId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stripeEventId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Issue`
--

LOCK TABLES `Issue` WRITE;
/*!40000 ALTER TABLE `Issue` DISABLE KEYS */;
/*!40000 ALTER TABLE `Issue` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Jobs`
--

DROP TABLE IF EXISTS `Jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Jobs` (
  `id` bigint(20) NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `percentCompletion` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Jobs`
--

LOCK TABLES `Jobs` WRITE;
/*!40000 ALTER TABLE `Jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `Jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Manufacturer`
--

DROP TABLE IF EXISTS `Manufacturer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Manufacturer` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `description` text COLLATE utf8_unicode_ci,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `origin` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1009 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Manufacturer`
--

LOCK TABLES `Manufacturer` WRITE;
/*!40000 ALTER TABLE `Manufacturer` DISABLE KEYS */;
INSERT INTO `Manufacturer` VALUES (1001,'Dick Taylor Chocolate Maker','Dick Taylor','US','www.dicktaylorchocolate.com'),(1002,'Ritual Chocolate Maker','Ritual','US','www.ritualchocolate.com'),(1003,'Madecasse Chocolate Maker','Madecasse','US','www.madecasse.com'),(1004,'Raaka Chocolate Maker','Raaka','US','www.raakachocolate.com'),(1005,'Vintage Plantations Chocolate Maker','Vintage Plantations','US','www.vintageplantations.com'),(1006,'Brasstown Chocolate Maker','Brasstown Chocolate','US','www.brasstownchocolate.com'),(1007,'Palette De Bine Chocolate Maker','Palette De Bine','CA','www.palettedebine.com'),(1008,'Chocosol Traders','Chocosol','CA','www.chocosoltraders.com');
/*!40000 ALTER TABLE `Manufacturer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Plan`
--

DROP TABLE IF EXISTS `Plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Plan` (
  `id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `amount` int(11) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  `currency` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `dimHeight` int(11) DEFAULT NULL,
  `dimLength` int(11) DEFAULT NULL,
  `dimWidth` int(11) DEFAULT NULL,
  `intervalCount` int(11) DEFAULT NULL,
  `intervalPeriod` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `isGift` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Plan`
--

LOCK TABLES `Plan` WRITE;
/*!40000 ALTER TABLE `Plan` DISABLE KEYS */;
/*!40000 ALTER TABLE `Plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Product`
--

DROP TABLE IF EXISTS `Product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Product` (
  `id` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `displayPriority` int(11) DEFAULT NULL,
  `cocoaOrigin` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cocoaPercent` int(11) DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cadSalePrice` int(11) DEFAULT NULL,
  `cadPrice` int(11) DEFAULT NULL,
  `usSalePrice` int(11) DEFAULT NULL,
  `usPrice` int(11) DEFAULT NULL,
  `numberOfImages` int(11) DEFAULT NULL,
  `productType` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stockQuantity` int(11) DEFAULT NULL,
  `weightImperial` double DEFAULT NULL,
  `weightMetric` double DEFAULT NULL,
  `urlSubPath` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `manufacturer_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_gfjajkp6pt7jd9yd9aybbvxvv` (`manufacturer_id`),
  CONSTRAINT `FK_gfjajkp6pt7jd9yd9aybbvxvv` FOREIGN KEY (`manufacturer_id`) REFERENCES `Manufacturer` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Product`
--

LOCK TABLES `Product` WRITE;
/*!40000 ALTER TABLE `Product` DISABLE KEYS */;
INSERT INTO `Product` VALUES ('DT0001',10,'MG',72,'The Dick Taylor Black Fig  bar features a delightful blend of 72% Madagascar Origin Cacao and dried black mission figs grown in California.\n\n This bar is remarkably beautiful, as most of the Dick Taylor bars however the combination of the fig sprinkled along the back of the bar adds an element of color that makes the bar look very special. The bar has a great chocolate flavor and texture which goes very well with the chewyness of the dried fig. The fig adds a great sweetness as well which is great for infusion lovers!','Black Fig',NULL,1195,NULL,850,2,'bar',108,2,57,'Dick-Taylor-Black-Fig',1001),('MD0001',10,'MG',70,'Madecasse Toasted Coconut is a very tasty infusion bar which takes 70% dark Madegascarian cacao and pairs it up with a layer of toasted coconut. This adds a crunch to the bar that typically isn\'t often found in our chocolate bars. Madecasse also infuses natural vanilla into these bars which adds subtle undertones that are a nice complement of the chocolate. This bar does contain soy, so be aware if you have any dietary restrictions.','Toasted Coconut',NULL,995,NULL,595,2,'bar',108,2.64,75,'Madecasse-Toasted-Coconut',1003),('RI0001',10,'MIX',70,'This is one of the most wonderful pairings, salt and chocolate. Ritual really nailed the flavors in this bar perfectly and it goes down as one of our favorites! Their 70% blend is mild and not overpowering but finished on the taste buds strong. The first taste of salt truly amplifies the flavor of the chocolate as well.','Fleur De Sel',NULL,795,NULL,550,3,'bar',0,1.5,42.5,'Ritual-Fleur-De-Sel',1002),('RI0002',10,'MG',75,'Made with organic cacao from the well-known Somia Plantation in the lower Sambirano Valley of Northern Madagascar. This chocoalte embodies notes of citrus and nuts as a result of the conditions in which the cacao is grown. As with all of Ritual bars, the smoothness of the chocoalte is on point and the flavors of the 75% are delightful.','Madagascar Sambirano',NULL,795,NULL,550,2,'bar',1,1.5,42.5,'Ritual-Madagascar-Sambirano',1002),('RI0003',10,'MIX',70,'The Ritual Chocolate \"Mid Mountain Blen\" is a mix of beans sourced from Peru, Ecuador, Venezuela, Magagascar and Belize. This 70% bar is a very nice compliment to all five bean sources. There are fruity undertones that come through late as the chocolate melts on your tounge.','Mid Mountain Blend',NULL,795,NULL,550,2,'bar',0,1.5,42.5,'Ritual-Mid-Mountain-Blend',1002),('RI0004',10,'EC',65,'In this collaboration bar Ritual decided to highlight Novo Coffee’s Anyetsu coffee and our Balao chocolate. Anyetsu is a sun-dried Ethiopian coffee known for its ripe berry and floral nuances. Our pairing of the Anyetsu with our Balao results in a flavor that is both daring and delicate: merging rich coffee and chocolate flavors that reveal notes of blueberry and honeycomb. This bar has strong coffee flavors throughout, definetly for anyone who loves coffee.','Novo Coffee Anyetsu',NULL,795,NULL,550,2,'bar',0,1.5,42.5,'Ritual-Novo-Coffee-Anyetsu',1002),('RI0005',10,'BZ',75,'Made with pure Nacional cacao from the remote Marañón River Valley in the Cajamarca Region of Peru. Marañón cacao contains a high ratio of white beans, which contributes to a lighter hue and inviting, subtle tannins. Enjoy this notably aromatic chocolate, characterized by floral, herbal and stone fruit flavors. For many chocoalte lovers, 75% provides the perfect chocolate intensity, we think this bar would be a great for those new to dark chocolate and those who love the farker side of things!','Peru Maranon',NULL,795,NULL,550,2,'bar',0,1.5,42.5,'Ritual-Peru-Maranon',1002),('RI0006',10,'PE',75,'Made with organic cacao that is grown by a network of Mayan farmers in the Toledo district of Belize. This area has a rich genetic history that is a blend of indigenous heirloom andTrinitario cacao. The result is a balanced chocolate with notes of dried fig, cherry and a hint of tobacco.','Belize Toledo',NULL,795,NULL,550,2,'bar',1,1.5,42.5,'Ritual-Belize-Toledo',1002);
/*!40000 ALTER TABLE `Product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductProfile`
--

DROP TABLE IF EXISTS `ProductProfile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProductProfile` (
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `profileType` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductProfile`
--

LOCK TABLES `ProductProfile` WRITE;
/*!40000 ALTER TABLE `ProductProfile` DISABLE KEYS */;
INSERT INTO `ProductProfile` VALUES ('Citrus','Notes of citrus fruits','flavor'),('Coarse','A little grainy and raw in texture','flavor'),('Coffee','Tastes of Coffee','flavor'),('Dark','Dark chocolate and contains no added milk or substitute','flavor'),('Fruity','Sweet fruit flavors or infusions with fruit','flavor'),('Infused','Combined with other flavorful ingredients','flavor'),('Mint','Notes of mint','flavor'),('Nut Free','Does not contain any nuts and does not state may contain nuts','dietary'),('Salty','Contains salt','flavor'),('Smooth','Texture is smooth and creamy','flavor'),('Soy Free','Does not contain any soy byproducts','dietary'),('Strong','Bold flavors that dominate the pallet','flavor'),('Vegan','Certified vegan on the package from the manufacturer','dietary');
/*!40000 ALTER TABLE `ProductProfile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ProductProfileMapping`
--

DROP TABLE IF EXISTS `ProductProfileMapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ProductProfileMapping` (
  `productId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `productProfileId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  PRIMARY KEY (`productId`,`productProfileId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ProductProfileMapping`
--

LOCK TABLES `ProductProfileMapping` WRITE;
/*!40000 ALTER TABLE `ProductProfileMapping` DISABLE KEYS */;
INSERT INTO `ProductProfileMapping` VALUES ('DT0001','dark'),('DT0001','infused'),('DT0001','sweet'),('MD0001','coarse'),('MD0001','dark'),('MD0001','infused'),('RI0001','infused'),('RI0001','salty'),('RI0001','smooth'),('RI0002','citrus'),('RI0002','dark'),('RI0002','smooth'),('RI0003','fruity'),('RI0003','smooth'),('RI0004','coffee'),('RI0004','infused'),('RI0004','smooth'),('RI0005','dark'),('RI0005','fruity'),('RI0005','smooth'),('RI0006','fruity'),('RI0006','smooth'),('RI0006','strong');
/*!40000 ALTER TABLE `ProductProfileMapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `RegistrationKey`
--

DROP TABLE IF EXISTS `RegistrationKey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `RegistrationKey` (
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `regKey` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `RegistrationKey`
--

LOCK TABLES `RegistrationKey` WRITE;
/*!40000 ALTER TABLE `RegistrationKey` DISABLE KEYS */;
/*!40000 ALTER TABLE `RegistrationKey` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Shipment`
--

DROP TABLE IF EXISTS `Shipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Shipment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `altShippingAddressId` bigint(20) DEFAULT NULL,
  `boxYearMonth` int(11) DEFAULT NULL,
  `chargeId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `creationDate` datetime DEFAULT NULL,
  `insuranceCost` double DEFAULT NULL,
  `isSubscriptionBox` bit(1) DEFAULT NULL,
  `labelData` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `packageDate` datetime DEFAULT NULL,
  `packageId` bigint(20) DEFAULT NULL,
  `pkgHeight` int(11) DEFAULT NULL,
  `pkgLength` int(11) DEFAULT NULL,
  `pkgWeight` int(11) DEFAULT NULL,
  `pkgWidth` int(11) DEFAULT NULL,
  `shipmentCost` int(11) DEFAULT NULL,
  `shippedDate` datetime DEFAULT NULL,
  `shippingRequired` bit(1) DEFAULT NULL,
  `ssId` bigint(20) DEFAULT NULL,
  `status` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stripeCustomerId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `trackingNumber` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `workingUserId` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1004839 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Shipment`
--

LOCK TABLES `Shipment` WRITE;
/*!40000 ALTER TABLE `Shipment` DISABLE KEYS */;
/*!40000 ALTER TABLE `Shipment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ShipmentItem`
--

DROP TABLE IF EXISTS `ShipmentItem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ShipmentItem` (
  `shipmentId` bigint(20) NOT NULL,
  `pricePaid` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `product_id` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`product_id`,`shipmentId`),
  CONSTRAINT `FK_i78tucvr5ldpdep90unplvpmf` FOREIGN KEY (`product_id`) REFERENCES `Product` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ShipmentItem`
--

LOCK TABLES `ShipmentItem` WRITE;
/*!40000 ALTER TABLE `ShipmentItem` DISABLE KEYS */;
/*!40000 ALTER TABLE `ShipmentItem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Source`
--

DROP TABLE IF EXISTS `Source`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Source` (
  `stripeId` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `sourceId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `brand` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `country` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `lastFour` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`stripeId`,`sourceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Source`
--

LOCK TABLES `Source` WRITE;
/*!40000 ALTER TABLE `Source` DISABLE KEYS */;
/*!40000 ALTER TABLE `Source` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Subscription`
--

DROP TABLE IF EXISTS `Subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Subscription` (
  `customerId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `subscriptionId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `altShippingAddressId` bigint(20) DEFAULT NULL,
  `currentPeriodEnd` datetime DEFAULT NULL,
  `currentPeriodStart` datetime DEFAULT NULL,
  `discountId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `start` datetime DEFAULT NULL,
  `status` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `taxPercent` double DEFAULT NULL,
  `plan_id` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`customerId`,`subscriptionId`),
  KEY `FK_7miyirmgvn9utcq6fsy7w1s2f` (`plan_id`),
  CONSTRAINT `FK_7miyirmgvn9utcq6fsy7w1s2f` FOREIGN KEY (`plan_id`) REFERENCES `Plan` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Subscription`
--

LOCK TABLES `Subscription` WRITE;
/*!40000 ALTER TABLE `Subscription` DISABLE KEYS */;
/*!40000 ALTER TABLE `Subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `stId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'JMGRANDE1988@GMAIL.COM','$2a$11$qaZ2dtKX73/42njTkQZvY.EkRMDvrGcP1E3y9ZKIlxid0WswwRTs2','cus_7W2QlyVgUzhnYt'),(2,'alextveit@gmail.com','$2a$11$vVup7WpwY8HE.mnH1iwvMeRHIrtXIh10VGkid6Gml.vpaW9w5yiKy','cus_7WLGrnKJUutcQo'),(3,'sorayakhaleeli51@gmail.com','$2a$11$e4EJghgaNJ9lTfppmqCymOYirpIwx3i9cUipcPPY6bmMSDoRvy54m','cus_7WLgBVQ966W0Ac'),(4,'d.berbenetz@gmail.com','$2a$11$FY/po/cEribwdu/mlYU9BuhyR3gNq3HuWLjXgrnfPHNXBY6IR4u12','cus_7WM3V4dNvXZOne'),(5,'v.berbenetz@gmail.com','$2a$11$Nr0vUcxXbqTtVc8c7SlyWuyhooBK9.ufGQURoCwgZM.fk7JktooRS','cus_7WMAjhQOqyZWB5'),(6,'val@cantangosolutions.com','$2a$11$2XdCI/i/9XfJUnUq8qKXQOg4/x9qPr1yhChwbyzUXMQRfd4ZBsbRq','cus_7XULK31Pj0Owtj'),(7,'val.berbenetz@gmail.com','$2a$11$xp7f0WTQWX5yXG7WD2EH2eBlPzE/n2JtQHgZvtk8CmRS/oQC.1WOi','cus_7XmzgyZYrgTmZB'),(8,'Irish_dancing_mama@hotmail.com','$2a$11$jZ5UkdgL7iQvXgtLETPT/.FlAWrTqEnW3vpJWbQ8qp.F3NTh16xd6','cus_7XvXUbsUrV0jEt'),(9,'Margie.radcliffe@gmail.com','$2a$11$wcAOCwDL60qFGuhWWr0FquG.nKTgJDrb7vt/dRjhF1gRub1Z47nkC','cus_7ZG0t4EbczWRyy'),(10,'jbgrande@gmail.com','$2a$11$9krxLbWN2NObonMuj5gis.7zUxMCz7SaKpbRxquBJkGfwPuSR9aWu','cus_7gBp0EwtAlDVKW'),(12,'Hubert.casimiro@gmail.com','$2a$11$O.MoVccoaPJACY3ORilSDeKRJ6DjekyBk/2Itmj8Ae1pPlwfxp9QG','cus_7j7a3D3EZJlCZ1'),(13,'z33bz_@hotmail.com','$2a$11$kZPxdHaKhHAUaMJxLNwVEu0SJ9d/D9kZldR6epX/xpF8Lo0cuAnAK','cus_7khvKtRJBT8g6M'),(14,'yzerman44@hotmail.com','$2a$11$NK1k8fP2k6kCspsN9LsM8usow2Cv5A/ML1G8SIhtD9dGxEyQkZUFa','cus_7nAylXELmimCDj'),(15,'andrew.rossignol@gmail.com','$2a$11$4Ba6vqdV3c4WmUFEJqrfZ.JaigIM3H2C5AVfHcOMVmkNVVWayXPpy','cus_7nmmQHY8Mek3Bt'),(16,'jmeister@gmail.com','$2a$11$s9Ddpoi.8dsvVUOlJyjZ9uh.xjidDZFYVrGcoD42NodciWNr1.Z9C','cus_7pS7ZaTW2MbBOC'),(17,'roberto.sd.costa@gmail.com','$2a$11$Nvufq/DhBI3L0n2TzlrG9OC6CF7q1480.NTLQCQ7FlTHnjRSE3yHG','cus_7s8wfQQFbmRekA'),(18,'Lauren.shirazie@Gmail.com','$2a$11$TXvvRkFWF/icp7M4LJRwdO92DmsrParJsBAdm2GPOXyIpdfdLwXSe','cus_7sF0QiQwhz7ySn'),(19,'lgrande2001@yahoo.ca','$2a$11$jmlKzsm1N3Df0BXOfPTpqeuq13lzdqKAX0230Ku7JRXfpPePxq3Ca','cus_7ssAVwcyFm6bbI'),(20,'Kamran.khaleeli@gmail.com','$2a$11$a98GVUEFjo5s6TuzTlzUdeDobv.ll3AshhAzqmSb45rURuiGU0V9C','cus_7taza0mwvorkQL'),(21,'luciebrou@gmail.com','$2a$11$8eU4pdDZcuL4iA/lpSD3N.psp7i4EyLyNh4znD0I4.CPvHrz66p4K','cus_7uoVBa0TYQ5Orv'),(22,'visern19@hotmail.com','$2a$11$yebmvxzfyvnvoP0qZ2d1ouC95OhuLvHkagejitOSz0m3N8t/hokJW','cus_7wAW3iR04uFTmn'),(23,'Julie.j.broughton@gmail.com','$2a$11$SZ7OIUzWy6OQS6cyGMWxMuVb06FLuq9lXOlmQ6Nm5rNbrDmUJh2lG','cus_7x0HOGuL57ALTJ');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-02-22 18:10:49
